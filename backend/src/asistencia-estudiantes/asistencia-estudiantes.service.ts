import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateAsistenciaEstDto } from './dto/create-asistencia-est.dto';
import { AsistenciaMasivaDto } from './dto/asistencia-masiva.dto';

@Injectable()
export class AsistenciaEstudiantesService {
  constructor(
    @Inject(PG_CONNECTION)
    private readonly pool: Pool,
  ) { }

  async registrarAsistenciaIndividual(dto: CreateAsistenciaEstDto) {
    try {
      const query = `
        CALL sp_registrar_asistencia_estudiante(
          $1, $2, $3, $4, $5
        );
      `;
      const values = [
        dto.id_estudiante,
        dto.id_aula,
        dto.id_horario,
        dto.fecha_real,
        dto.presente,
      ];

      await this.pool.query(query, values);

      return {
        message: 'Asistencia registrada correctamente',
        data: dto,
      };
    } catch (error) {
      // Los errores del stored procedure vienen como PostgreSQL errors
      if (error.code === 'P0001') { // RAISE EXCEPTION en plpgsql
        const message = error.message;

        if (message.includes('no existe') ||
          message.includes('no encontrado') ||
          message.includes('no está asignado')) {
          throw new NotFoundException(message);
        } else if (message.includes('festivo') ||
          message.includes('no pertenece') ||
          message.includes('Ya existe')) {
          throw new BadRequestException(message);
        }
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al registrar asistencia individual: ${error.message}`
      );
    }
  }

  async registrarAsistenciaMasiva(dto: AsistenciaMasivaDto) {
    try {
      const query = `
        CALL sp_registrar_asistencia_aula_masiva(
          $1, $2, $3, $4
        );
      `;

      const values = [
        dto.id_aula,
        dto.id_horario,
        dto.fecha_real,
        dto.estudiantes_presentes,
      ];

      await this.pool.query(query, values);

      return {
        message: 'Asistencia masiva registrada correctamente',
      };
    } catch (error) {
      // Los errores del stored procedure vienen como PostgreSQL errors
      if (error.code === 'P0001') { // RAISE EXCEPTION en plpgsql
        const message = error.message;

        if (message.includes('no existe') ||
          message.includes('no encontrado')) {
          throw new NotFoundException(message);
        } else if (message.includes('festivo') ||
          message.includes('no pertenece') ||
          message.includes('duplicados')) {
          throw new BadRequestException(message);
        }
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error al registrar asistencia masiva: ${error.message}`
      );
    }
  }

  async obtenerAsistenciaPorEstudiante(id_estudiante: number) {
    try {
      const query = `
        SELECT *
        FROM asistenciaEst
        WHERE id_estudiante = $1
        ORDER BY fecha_real DESC;
      `;

      const { rows } = await this.pool.query(query, [id_estudiante]);
      return rows;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener asistencias del estudiante: ${error.message}`
      );
    }
  }

  async obtenerAsistenciaPorAula(id_aula: number) {
    try {
      const query = `
        SELECT *
        FROM asistenciaEst
        WHERE id_aula = $1
        ORDER BY fecha_real DESC;
      `;

      const { rows } = await this.pool.query(query, [id_aula]);
      return rows;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener asistencias del aula: ${error.message}`
      );
    }
  }
}
