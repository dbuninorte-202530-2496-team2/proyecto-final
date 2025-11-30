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

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
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
      id_motivo,
      fecha_reposicion
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
          id_motivo = COALESCE($6, id_motivo),
          fecha_reposicion = COALESCE($7, fecha_reposicion)
        WHERE id = $8
        RETURNING *
      `;
      const result = await this.pool.query(updateQuery, [
        fecha_real,
        dictoClase,
        id_tutor,
        id_aula,
        id_horario,
        id_motivo,
        fecha_reposicion,
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


}