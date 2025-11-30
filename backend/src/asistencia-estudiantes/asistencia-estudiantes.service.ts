import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateAsistenciaEstDto } from './dto/create-asistencia-est.dto';
import { AsistenciaMasivaDto } from './dto/asistencia-masiva.dto';

@Injectable()
export class AsistenciaEstudiantesService {
  constructor(
    @Inject(PG_CONNECTION)
    private readonly pool: Pool,
  ) {}

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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
