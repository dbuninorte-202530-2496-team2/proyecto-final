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
  ) {}

  async create(createPeriodoDto: CreatePeriodoDto): Promise<PeriodoEntity> {
    const { anho } = createPeriodoDto;

    try {
      // Verificar si ya existe un periodo con ese año
      const checkQuery = 'SELECT id FROM periodo WHERE anho = $1';
      const checkResult = await this.pool.query(checkQuery, [anho]);

      if (checkResult.rows.length > 0) {
        throw new BadRequestException(`Ya existe un periodo para el año ${anho}`);
      }

      // Crear el periodo
      const insertQuery = `
        INSERT INTO periodo (anho)
        VALUES ($1)
        RETURNING *
      `;
      const result = await this.pool.query(insertQuery, [anho]);
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al crear el periodo: ${error.message}`
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
    // Verificar que existe
    await this.findOne(id);

    const { anho } = updatePeriodoDto;

    try {
      // Si se está actualizando el año, verificar que no exista otro periodo con ese año
      if (anho !== undefined) {
        const checkQuery = 'SELECT id FROM periodo WHERE anho = $1 AND id != $2';
        const checkResult = await this.pool.query(checkQuery, [anho, id]);

        if (checkResult.rows.length > 0) {
          throw new BadRequestException(`Ya existe otro periodo para el año ${anho}`);
        }
      }

      const updateQuery = `
        UPDATE periodo 
        SET anho = COALESCE($1, anho)
        WHERE id = $2
        RETURNING *
      `;
      const result = await this.pool.query(updateQuery, [anho, id]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al actualizar el periodo: ${error.message}`
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    // Verificar que existe
    await this.findOne(id);

    try {
      // Verificar si tiene semanas asociadas
      const checkQuery = 'SELECT COUNT(*) as count FROM semana WHERE id_periodo = $1';
      const checkResult = await this.pool.query(checkQuery, [id]);

      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new BadRequestException(
          'No se puede eliminar el periodo porque tiene semanas asociadas'
        );
      }

      const deleteQuery = 'DELETE FROM periodo WHERE id = $1';
      await this.pool.query(deleteQuery, [id]);

      return { message: `Periodo con id ${id} eliminado correctamente` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
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
  ): Promise<{ message: string; semanas_creadas: number }> {
    // Verificar que el periodo existe
    await this.findOne(id_periodo);

    const { fec_ini, cantidad_semanas } = generarSemanasDto;

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verificar si ya existen semanas para este periodo
      const checkQuery = 'SELECT COUNT(*) as count FROM semana WHERE id_periodo = $1';
      const checkResult = await client.query(checkQuery, [id_periodo]);

      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new BadRequestException(
          'El periodo ya tiene semanas generadas. Elimínelas primero si desea regenerar.'
        );
      }

      // Generar las semanas
      const insertQuery = `
        INSERT INTO semana (fec_ini, id_periodo)
        VALUES ($1, $2)
        RETURNING *
      `;

      let semanasCreadas = 0;
      const fechaInicio = new Date(fec_ini);

      for (let i = 0; i < cantidad_semanas; i++) {
        const fechaSemana = new Date(fechaInicio);
        fechaSemana.setDate(fechaInicio.getDate() + (i * 7));
        
        const fechaFormateada = fechaSemana.toISOString().split('T')[0];
        
        await client.query(insertQuery, [fechaFormateada, id_periodo]);
        semanasCreadas++;
      }

      await client.query('COMMIT');

      return {
        message: `Se generaron ${semanasCreadas} semanas exitosamente`,
        semanas_creadas: semanasCreadas,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al generar las semanas: ${error.message}`
      );
    } finally {
      client.release();
    }
  }
}