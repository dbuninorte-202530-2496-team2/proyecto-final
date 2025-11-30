import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { AsignarEstudianteAulaDto } from './dto/asignar-estudiante-aula.dto';
import { MoverEstudianteDto } from './dto/mover-estudiante.dto';

@Injectable()
export class EstudianteAulaService {
  constructor(
    @Inject(PG_CONNECTION)
    private readonly pool: Pool,
  ) {}

  async asignarEstudiante(id_estudiante: number, dto: AsignarEstudianteAulaDto) {
    try {
      const query = `
        CALL sp_asignar_estudiante_aula(
          $1, $2, $3
        );
      `;
      const values = [
        id_estudiante,
        dto.id_aula,
        dto.fecha_asignado,
      ];

      await this.pool.query(query, values);

      return {
        message: 'Estudiante asignado correctamente al aula',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async moverEstudiante(id_estudiante: number, dto: MoverEstudianteDto) {
    try {
      const query = `
        CALL sp_mover_estudiante_aula(
          $1, $2, $3
        );
      `;
      const values = [
        id_estudiante,
        dto.id_aula_destino,
        dto.fecha_desasignado,
      ];

      await this.pool.query(query, values);

      return {
        message: 'Estudiante movido correctamente al aula destino',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async obtenerHistorico(id_estudiante: number) {
    try {
      const query = `
        SELECT *
        FROM estudiante_aula
        WHERE id_estudiante = $1
        ORDER BY fecha_asignado DESC;
      `;

      const { rows } = await this.pool.query(query, [id_estudiante]);
      return rows;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
