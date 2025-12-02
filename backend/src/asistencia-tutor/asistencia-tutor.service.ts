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
  UpdateAsistenciaTutDto
} from './dto';
import { AsistenciaTutEntity } from './entities/asistencia-tut.entity';

@Injectable()
export class AsistenciaTutorService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) { }

  async create(createAsistenciaDto: CreateAsistenciaTutDto): Promise<AsistenciaTutEntity> {
    const {
      fecha_real,
      dictoClase,
      id_tutor,
      id_aula,
      id_horario,
      id_motivo,
      fecha_reposicion
    } = createAsistenciaDto;

    try {
      // Llamar al stored procedure que maneja todas las validaciones
      await this.pool.query(
        'CALL sp_registrar_asistencia_tutor($1, $2, $3, $4, $5, $6)',
        [id_tutor, id_aula, id_horario, fecha_real, dictoClase, id_motivo || null]
      );

      // Si se proporcionó fecha_reposicion, actualizarla (sin validaciones adicionales)
      if (fecha_reposicion) {
        await this.pool.query(
          'UPDATE asistenciaTut SET fecha_reposicion = $1 WHERE id_tutor = $2 AND id_aula = $3 AND id_horario = $4 AND fecha_real = $5',
          [fecha_reposicion, id_tutor, id_aula, id_horario, fecha_real]
        );
      }

      // Obtener el registro insertado/actualizado para devolverlo
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
        WHERE at.id_tutor = $1
          AND at.id_aula = $2
          AND at.id_horario = $3
          AND at.fecha_real = $4
        ORDER BY at.id DESC
        LIMIT 1
      `;
      const result = await this.pool.query(query, [id_tutor, id_aula, id_horario, fecha_real]);

      if (result.rows.length === 0) {
        throw new InternalServerErrorException('Error al recuperar la asistencia creada');
      }

      return result.rows[0];
    } catch (error) {
      // Los errores del stored procedure vienen como PostgreSQL errors
      if (error.code === 'P0001') { // RAISE EXCEPTION en plpgsql
        const message = error.message;

        if (message.includes('no existe') ||
          message.includes('no tiene tutor') ||
          message.includes('no pertenece')) {
          throw new NotFoundException(message);
        } else if (message.includes('no está asignado') ||
          message.includes('Debe proporcionar') ||
          message.includes('festivo')) {
          throw new BadRequestException(message);
        }
      }

      this.handleDBExceptions(error)
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
      this.handleDBExceptions(error)
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
      this.handleDBExceptions(error)
    }
  }

  async update(
    id: number,
    updateAsistenciaDto: UpdateAsistenciaTutDto
  ): Promise<AsistenciaTutEntity> {
    await this.findOne(id);

    let {
      fecha_real,
      dictoClase,
      id_tutor,
      id_aula,
      id_horario,
      id_motivo,
      fecha_reposicion
    } = updateAsistenciaDto;

    try {
      // --- VALIDACIÓN DE NEGOCIO ---
      if (dictoClase !== undefined) {
        if (!dictoClase && !id_motivo) {
          throw new BadRequestException(
            'Si el tutor no dictó la clase, debe especificar un motivo'
          );
        }

        if (dictoClase && id_motivo) {
          throw new BadRequestException(
            'Si el tutor dictó la clase, no debe especificar un motivo'
          );
        }

        // Si pasa de NO dictar -> dictar, forzar borrado del motivo Y fecha_reposicion
        if (dictoClase === true) {
          id_motivo = null;
          fecha_reposicion = null;  // Forzar limpieza
        }
      }

      // Construcción del query
      // Tanto id_motivo como fecha_reposicion NO usan COALESCE
      // Esto permite que se puedan borrar explícitamente enviando null
      const updateQuery = `
      UPDATE asistenciaTut
      SET
        fecha_real = COALESCE($1, fecha_real),
        dictoClase = COALESCE($2, dictoClase),
        id_tutor = COALESCE($3, id_tutor),
        id_aula = COALESCE($4, id_aula),
        id_horario = COALESCE($5, id_horario),
        id_motivo = $6,
        fecha_reposicion = $7
      WHERE id = $8
      RETURNING *
    `;

      const result = await this.pool.query(updateQuery, [
        fecha_real,
        dictoClase,
        id_tutor,
        id_aula,
        id_horario,
        id_motivo,           // puede ser null
        fecha_reposicion,    // puede ser null
        id
      ]);

      return result.rows[0];
    } catch (error) {
      this.handleDBExceptions(error);
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
      this.handleDBExceptions(error)
    }
  }

  async findClasesProgramadas(
    id_tutor: number,
    fecha_inicio: string,
    fecha_fin: string
  ): Promise<any[]> {
    try {
      // Verificar que el tutor existe
      const tutorCheck = await this.pool.query('SELECT id FROM personal WHERE id = $1', [id_tutor]);
      if (tutorCheck.rows.length === 0) {
        throw new NotFoundException(`Tutor con id ${id_tutor} no encontrado`);
      }

      const query = `
        SELECT 
          ahs.fecha_programada,
          ahs.id_aula,
          CONCAT(a.grado, '°', a.grupo) AS aula_info,
          se.nombre AS sede_nombre,
          i.nombre AS institucion_nombre,
          ahs.id_horario,
          CONCAT(h.dia_sem, ' ', h.hora_ini, '-', h.hora_fin) AS horario_info,
          ahs.id_semana,
          at.id IS NOT NULL AS tiene_asistencia,
          at.id AS id_asistencia,
          at.dictoClase AS dicto_clase,
          at.id_motivo,
          m.descripcion AS descripcion_motivo,
          at.fecha_reposicion
        FROM tutor_aula ta
        INNER JOIN aula_horario_sem ahs ON ta.id_aula = ahs.id_aula
        INNER JOIN horario h ON ahs.id_horario = h.id
        INNER JOIN aula a ON ahs.id_aula = a.id
        INNER JOIN sede se ON a.id_sede = se.id
        INNER JOIN institucion i ON se.id_inst = i.id
        LEFT JOIN asistenciaTut at ON (
          at.id_tutor = ta.id_tutor AND
          at.id_aula = ahs.id_aula AND
          at.id_horario = ahs.id_horario AND
          at.id_semana = ahs.id_semana
        )
        LEFT JOIN motivo m ON at.id_motivo = m.id
        WHERE ta.id_tutor = $1
          AND ta.fecha_desasignado IS NULL
          AND ahs.fecha_programada BETWEEN $2 AND $3
        ORDER BY ahs.fecha_programada, h.hora_ini
      `;

      const result = await this.pool.query(query, [id_tutor, fecha_inicio, fecha_fin]);
      return result.rows;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async getEarliestWeekDate(id_tutor: number): Promise<string | null> {
    try {
      // Verificar que el tutor existe
      const tutorCheck = await this.pool.query('SELECT id FROM personal WHERE id = $1', [id_tutor]);
      if (tutorCheck.rows.length === 0) {
        throw new NotFoundException(`Tutor con id ${id_tutor} no encontrado`);
      }

      const query = `
        SELECT MIN(s.fec_ini) as earliest_date
        FROM semana s
        INNER JOIN aula_horario_sem ahs ON ahs.id_semana = s.id
        INNER JOIN tutor_aula ta ON ta.id_aula = ahs.id_aula
        WHERE ta.id_tutor = $1
          AND ta.fecha_desasignado IS NULL
      `;

      const result = await this.pool.query(query, [id_tutor]);

      if (result.rows.length === 0 || !result.rows[0].earliest_date) {
        return null;
      }

      // Formatear fecha a YYYY-MM-DD
      const date = new Date(result.rows[0].earliest_date);
      return date.toISOString().split('T')[0];
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error instanceof NotFoundException) {
      throw error;
    }
    console.log(error)
    throw new InternalServerErrorException(
      `Error al obtener las clases programadas: ${error.message}`
    );
  }


}