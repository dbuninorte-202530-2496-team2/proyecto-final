import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { AsignarTutorDto, DesasignarTutorDto } from './dto';
import { TutorAulaEntity } from './entities/tutor-aula.entity';

@Injectable()
export class TutorAulaService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) { }

  async findTutoresActuales(id_aula: number): Promise<TutorAulaEntity[]> {
    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const query = `
        SELECT 
          ta.id_tutor,
          ta.id_aula,
          ta.consec,
          ta.fecha_asignado,
          ta.fecha_desasignado,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          CASE WHEN ta.fecha_desasignado IS NULL THEN true ELSE false END as activo
        FROM tutor_aula ta
        INNER JOIN personal p ON ta.id_tutor = p.id
        WHERE ta.id_aula = $1 AND ta.fecha_desasignado IS NULL
        ORDER BY ta.fecha_asignado DESC
      `;
      const result = await this.pool.query(query, [id_aula]);
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener los tutores actuales: ${error.message}`
      );
    }
  }

  async findTutoresHistorico(id_aula: number): Promise<TutorAulaEntity[]> {
    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const query = `
        SELECT 
          ta.id_tutor,
          ta.id_aula,
          ta.consec,
          ta.fecha_asignado,
          ta.fecha_desasignado,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          CASE WHEN ta.fecha_desasignado IS NULL THEN true ELSE false END as activo
        FROM tutor_aula ta
        INNER JOIN personal p ON ta.id_tutor = p.id
        WHERE ta.id_aula = $1
        ORDER BY ta.fecha_asignado DESC, ta.consec DESC
      `;
      const result = await this.pool.query(query, [id_aula]);
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener el histórico de tutores: ${error.message}`
      );
    }
  }

  async asignarTutor(
    id_aula: number,
    asignarTutorDto: AsignarTutorDto
  ): Promise<TutorAulaEntity> {
    const { id_tutor, fecha_asignado } = asignarTutorDto;

    try {
      // Llamar al stored procedure
      await this.pool.query(
        'CALL sp_asignar_tutor_aula($1, $2, $3)',
        [id_aula, id_tutor, fecha_asignado || new Date()]
      );

      // Obtener el registro insertado para devolverlo
      const query = `
        SELECT 
          ta.id_tutor,
          ta.id_aula,
          ta.consec,
          ta.fecha_asignado,
          ta.fecha_desasignado,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          true as activo
        FROM tutor_aula ta
        INNER JOIN personal p ON ta.id_tutor = p.id
        WHERE ta.id_tutor = $1 AND ta.id_aula = $2 AND ta.fecha_desasignado IS NULL
        ORDER BY ta.consec DESC
        LIMIT 1
      `;
      const result = await this.pool.query(query, [id_tutor, id_aula]);

      if (result.rows.length === 0) {
        throw new InternalServerErrorException('Error al recuperar la asignación creada');
      }

      return result.rows[0];
    } catch (error) {
      // Los errores del stored procedure vienen como PostgreSQL errors
      if (error.code === 'P0001') { // RAISE EXCEPTION en plpgsql
        const message = error.message;

        if (message.includes('no existe')) {
          throw new NotFoundException(message);
        } else if (message.includes('ya tiene un tutor asignado') ||
          message.includes('no tiene el rol adecuado')) {
          throw new BadRequestException(message);
        }
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al asignar el tutor: ${error.message}`
      );
    }
  }

  async desasignarTutor(
    id_aula: number,
    id_tutor: number,
    desasignarTutorDto: DesasignarTutorDto
  ): Promise<TutorAulaEntity> {
    const { fecha_desasignado } = desasignarTutorDto;

    try {
      // Llamar al stored procedure
      await this.pool.query(
        'CALL sp_desasignar_tutor_aula($1, $2, $3)',
        [id_aula, id_tutor, fecha_desasignado || new Date()]
      );

      // Obtener el registro actualizado para devolverlo
      const query = `
        SELECT 
          ta.id_tutor,
          ta.id_aula,
          ta.consec,
          ta.fecha_asignado,
          ta.fecha_desasignado,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          false as activo
        FROM tutor_aula ta
        INNER JOIN personal p ON ta.id_tutor = p.id
        WHERE ta.id_tutor = $1 AND ta.id_aula = $2 AND ta.fecha_desasignado IS NOT NULL
        ORDER BY ta.consec DESC
        LIMIT 1
      `;
      const result = await this.pool.query(query, [id_tutor, id_aula]);

      if (result.rows.length === 0) {
        throw new InternalServerErrorException('Error al recuperar la asignación desasignada');
      }

      return result.rows[0];
    } catch (error) {
      // Los errores del stored procedure vienen como PostgreSQL errors
      if (error.code === 'P0001') { // RAISE EXCEPTION en plpgsql
        const message = error.message;

        if (message.includes('No existe una asignación activa')) {
          throw new NotFoundException(message);
        } else if (message.includes('no puede ser anterior')) {
          throw new BadRequestException(message);
        }
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al desasignar el tutor: ${error.message}`
      );
    }
  }
}