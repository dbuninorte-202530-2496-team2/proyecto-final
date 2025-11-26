import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreatePeriodoDto, UpdatePeriodoDto, GenerarSemanasDto } from './dto';
import { PeriodoEntity, SemanaEntity } from './entities';

@Injectable()
export class PeriodosService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) { }

  async create(createPeriodoDto: CreatePeriodoDto): Promise<PeriodoEntity> {
    const { anho, numero } = createPeriodoDto;

    try {
      const query = `
      INSERT INTO periodo (anho, numero)
      VALUES ($1, $2)
      RETURNING *
    `;

      const result = await this.pool.query(query, [anho, numero]);
      return result.rows[0];

    } catch (error: any) {

      if (error.code === '23505') {
        throw new BadRequestException(
          `Ya existe un periodo ${anho}-${numero}`
        );
      }

      throw new InternalServerErrorException(
        `Error al crear el periodo: ${error.message}`,
      );
    }
  }


  async findAll(): Promise<PeriodoEntity[]> {
    try {
      const query = 'SELECT * FROM periodo ORDER BY anho DESC';
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los periodos: ${error.message}`
      );
    }
  }

  async findOne(id: number): Promise<PeriodoEntity> {
    try {
      const query = 'SELECT * FROM periodo WHERE id = $1';
      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new NotFoundException(`Periodo con id ${id} no encontrado`);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener el periodo: ${error.message}`
      );
    }
  }

  async update(id: number, updatePeriodoDto: UpdatePeriodoDto): Promise<PeriodoEntity> {
    const { anho, numero } = updatePeriodoDto;

    try {
      const query = `
      UPDATE periodo
      SET 
        anho   = COALESCE($1, anho),
        numero = COALESCE($2, numero)
      WHERE id = $3
      RETURNING *
    `;

      const result = await this.pool.query(query, [anho, numero, id]);

      if (result.rowCount === 0) {
        throw new NotFoundException(`No existe el periodo con id ${id}`);
      }

      return result.rows[0];

    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(
          `Ya existe un periodo ${anho}-${numero}`
        );
      }

      throw new InternalServerErrorException(
        `Error al actualizar el periodo: ${error.message}`
      );
    }
  }



  async remove(id: number): Promise<{ message: string }> {
    try {
      const result = await this.pool.query(
        'DELETE FROM periodo WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`No existe el periodo con id ${id}`);
      }

      return { message: `Periodo con id ${id} eliminado correctamente` };

    } catch (error: any) {

      // Si la FK lo bloquea → 23503
      if (error.code === '23503') {
        throw new BadRequestException(
          'No se puede eliminar el periodo porque tiene semanas asociadas'
        );
      }

      throw new InternalServerErrorException(
        `Error al eliminar el periodo: ${error.message}`
      );
    }
  }


  async findSemanasByPeriodo(id_periodo: number): Promise<SemanaEntity[]> {
    // Verificar que el periodo existe
    await this.findOne(id_periodo);

    try {
      const query = `
        SELECT 
          id,
          fec_ini,
          fec_fin,
          id_periodo
        FROM semana
        WHERE id_periodo = $1
        ORDER BY fec_ini ASC
      `;
      const result = await this.pool.query(query, [id_periodo]);
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener las semanas del periodo: ${error.message}`
      );
    }
  }

  async generarSemanas(
    id_periodo: number,
    generarSemanasDto: GenerarSemanasDto
  ): Promise<{ message: string; semanas_creadas: number; info: any }> {
    await this.findOne(id_periodo);
    const { fec_ini, cantidad_semanas } = generarSemanasDto;

    try {
      // /sql/init/06.calendario.sql
      await this.pool.query(
        'CALL sp_crear_calendario_semanas($1, $2, $3)',
        [id_periodo, fec_ini, cantidad_semanas]
      );

      // Obtener información del calendario
      const infoQuery = 'SELECT * FROM fn_info_calendario_periodo($1)';
      const infoResult = await this.pool.query(infoQuery, [id_periodo]);
      const info = infoResult.rows[0];

      return {
        message: `Se generaron ${info.total_semanas} semanas exitosamente`,
        semanas_creadas: info.total_semanas,
        info: {
          primera_semana: { inicio: info.primera_semana_inicio, fin: info.primera_semana_fin },
          ultima_semana: { inicio: info.ultima_semana_inicio, fin: info.ultima_semana_fin },
          duracion_total_dias: info.duracion_dias,
        }
      };
    } catch (error) {
      if (error.message.includes('Ya existen semanas')) {
        throw new BadRequestException('El periodo ya tiene semanas generadas...');
      }
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }

  async getInfoCalendario(id_periodo: number): Promise<any> {
    // Verificar que el periodo existe
    await this.findOne(id_periodo);

    try {
      const query = 'SELECT * FROM fn_info_calendario_periodo($1)';
      const result = await this.pool.query(query, [id_periodo]);
      
      if (!result.rows[0] || result.rows[0].total_semanas === 0) {
        throw new NotFoundException(
          `El periodo ${id_periodo} no tiene semanas generadas aún`
        );
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener información del calendario: ${error.message}`
      );
    }
  }
}