import { 
  Injectable, 
  Inject, 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { 
  CreateAsistenciaTutDto, 
  UpdateAsistenciaTutDto, 
  RegistrarReposicionDto 
} from './dto';
import { AsistenciaTutEntity } from './entities/asistencia-tut.entity';

@Injectable()
export class AsistenciaTutorService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) {}

  async create(createAsistenciaDto: CreateAsistenciaTutDto): Promise<AsistenciaTutEntity> {
    const { 
      fecha_real, 
      dictoClase, 
      id_tutor, 
      id_aula, 
      id_horario, 
      id_semana,
      id_motivo 
    } = createAsistenciaDto;

    try {
      // Validar que si dictoClase = false, debe haber id_motivo
      if (!dictoClase && !id_motivo) {
        throw new BadRequestException(
          'Si el tutor no dictó la clase, debe especificar un motivo'
        );
      }

      // Validar que si dictoClase = true, NO debe haber id_motivo
      if (dictoClase && id_motivo) {
        throw new BadRequestException(
          'Si el tutor dictó la clase, no debe especificar un motivo de inasistencia'
        );
      }

      // Verificar que existe la asignación tutor-aula-horario-semana
      const sesionQuery = `
        SELECT ahs.* 
        FROM aula_horario_sem ahs
        INNER JOIN tutor_aula ta ON ahs.id_aula = ta.id_aula
        WHERE ahs.id_aula = $1 
          AND ahs.id_horario = $2 
          AND ahs.id_semana = $3
          AND ta.id_tutor = $4
          AND ta.fecha_desasignado IS NULL
      `;
      const sesionResult = await this.pool.query(sesionQuery, [
        id_aula, 
        id_horario, 
        id_semana,
        id_tutor
      ]);

      if (sesionResult.rows.length === 0) {
        throw new BadRequestException(
          'No existe una sesión válida para este tutor, aula, horario y semana'
        );
      }

      // Verificar que no exista ya un registro de asistencia para esta combinación
      const existeQuery = `
        SELECT id FROM asistenciaTut 
        WHERE id_tutor = $1 
          AND id_aula = $2 
          AND id_horario = $3 
          AND fecha_real = $4
      `;
      const existeResult = await this.pool.query(existeQuery, [
        id_tutor,
        id_aula,
        id_horario,
        fecha_real
      ]);

      if (existeResult.rows.length > 0) {
        throw new BadRequestException(
          'Ya existe un registro de asistencia para esta fecha, tutor, aula y horario'
        );
      }

      // Crear el registro de asistencia
      const insertQuery = `
        INSERT INTO asistenciaTut (
          fecha_real, 
          dictoClase, 
          id_tutor, 
          id_aula, 
          id_horario, 
          id_semana,
          id_motivo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await this.pool.query(insertQuery, [
        fecha_real,
        dictoClase,
        id_tutor,
        id_aula,
        id_horario,
        id_semana,
        id_motivo || null
      ]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al crear la asistencia: ${error.message}`
      );
    }
  }

  async findAll(): Promise<AsistenciaTutEntity[]> {
    try {
      const query = `
        SELECT 
          at.*,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          m.descripcion as descripcion_motivo,
          h.dia_sem,
          h.hora_ini,
          h.hora_fin
        FROM asistenciaTut at
        INNER JOIN personal p ON at.id_tutor = p.id
        INNER JOIN horario h ON at.id_horario = h.id
        LEFT JOIN motivo m ON at.id_motivo = m.id
        ORDER BY at.fecha_real DESC, at.id_aula, h.hora_ini
      `;
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener las asistencias: ${error.message}`
      );
    }
  }

  async findOne(id: number): Promise<AsistenciaTutEntity> {
    try {
      const query = `
        SELECT 
          at.*,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          m.descripcion as descripcion_motivo,
          h.dia_sem,
          h.hora_ini,
          h.hora_fin
        FROM asistenciaTut at
        INNER JOIN personal p ON at.id_tutor = p.id
        INNER JOIN horario h ON at.id_horario = h.id
        LEFT JOIN motivo m ON at.id_motivo = m.id
        WHERE at.id = $1
      `;
      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new NotFoundException(`Asistencia con id ${id} no encontrada`);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener la asistencia: ${error.message}`
      );
    }
  }

  async update(
    id: number, 
    updateAsistenciaDto: UpdateAsistenciaTutDto
  ): Promise<AsistenciaTutEntity> {
    // Verificar que existe
    await this.findOne(id);

    const { 
      fecha_real, 
      dictoClase, 
      id_tutor, 
      id_aula, 
      id_horario, 
      id_semana,
      id_motivo 
    } = updateAsistenciaDto;

    try {
      // Validar lógica de negocio si se actualiza dictoClase
      if (dictoClase !== undefined) {
        if (!dictoClase && !id_motivo) {
          throw new BadRequestException(
            'Si el tutor no dictó la clase, debe especificar un motivo'
          );
        }
        if (dictoClase && id_motivo) {
          throw new BadRequestException(
            'Si el tutor dictó la clase, no debe especificar un motivo de inasistencia'
          );
        }
      }

      const updateQuery = `
        UPDATE asistenciaTut 
        SET 
          fecha_real = COALESCE($1, fecha_real),
          dictoClase = COALESCE($2, dictoClase),
          id_tutor = COALESCE($3, id_tutor),
          id_aula = COALESCE($4, id_aula),
          id_horario = COALESCE($5, id_horario),
          id_semana = COALESCE($6, id_semana),
          id_motivo = COALESCE($7, id_motivo)
        WHERE id = $8
        RETURNING *
      `;
      const result = await this.pool.query(updateQuery, [
        fecha_real,
        dictoClase,
        id_tutor,
        id_aula,
        id_horario,
        id_semana,
        id_motivo,
        id
      ]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al actualizar la asistencia: ${error.message}`
      );
    }
  }

  async findAsistenciasByTutor(
    id_tutor: number,
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<AsistenciaTutEntity[]> {
    try {
      // Verificar que el tutor existe
      const tutorCheck = await this.pool.query('SELECT id FROM personal WHERE id = $1', [id_tutor]);
      if (tutorCheck.rows.length === 0) {
        throw new NotFoundException(`Tutor con id ${id_tutor} no encontrado`);
      }

      let query = `
        SELECT 
          at.*,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          m.descripcion as descripcion_motivo,
          h.dia_sem,
          h.hora_ini,
          h.hora_fin
        FROM asistenciaTut at
        INNER JOIN personal p ON at.id_tutor = p.id
        INNER JOIN horario h ON at.id_horario = h.id
        LEFT JOIN motivo m ON at.id_motivo = m.id
        WHERE at.id_tutor = $1
      `;

      const params: any[] = [id_tutor];

      if (fecha_inicio && fecha_fin) {
        query += ' AND at.fecha_real BETWEEN $2 AND $3';
        params.push(fecha_inicio, fecha_fin);
      } else if (fecha_inicio) {
        query += ' AND at.fecha_real >= $2';
        params.push(fecha_inicio);
      } else if (fecha_fin) {
        query += ' AND at.fecha_real <= $2';
        params.push(fecha_fin);
      }

      query += ' ORDER BY at.fecha_real DESC, h.hora_ini';

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener las asistencias del tutor: ${error.message}`
      );
    }
  }

  async registrarReposicion(
    id: number,
    registrarReposicionDto: RegistrarReposicionDto
  ): Promise<{ message: string; asistencia: AsistenciaTutEntity }> {
    // Verificar que existe
    const asistencia = await this.findOne(id);

    const { fecha_reposicion } = registrarReposicionDto;

    try {
      // Validar que la clase no se dictó
      if (asistencia.dictoClase) {
        throw new BadRequestException(
          'No se puede registrar reposición de una clase que sí se dictó'
        );
      }

      // Validar que no tenga ya fecha de reposición
      if (asistencia.fecha_reposicion) {
        throw new BadRequestException(
          'Esta clase ya tiene una fecha de reposición registrada'
        );
      }

      // Actualizar la fecha de reposición
      const updateQuery = `
        UPDATE asistenciaTut 
        SET fecha_reposicion = $1
        WHERE id = $2
        RETURNING *
      `;
      const result = await this.pool.query(updateQuery, [fecha_reposicion, id]);

      return {
        message: `Reposición registrada para la fecha ${fecha_reposicion}. Recuerde crear la sesión correspondiente en aula_horario_sem.`,
        asistencia: result.rows[0]
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al registrar la reposición: ${error.message}`
      );
    }
  }
}