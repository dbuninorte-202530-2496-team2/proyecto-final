import {
    Injectable,
    Inject,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { UpdateFestivoDto } from './dto/update-festivo.dto';
import { FestivoEntity } from './entities/festivo.entity';

@Injectable()
export class FestivoService {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    async create(createFestivoDto: CreateFestivoDto): Promise<FestivoEntity> {
        const { fecha, descripcion } = createFestivoDto;

        try {
            const query = `
        INSERT INTO festivo (fecha, descripcion)
        VALUES ($1, $2)
        RETURNING *
      `;
            const result = await this.pool.query(query, [fecha, descripcion]);
            return result.rows[0];
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al crear el festivo: ${error.message}`
            );
        }
    }

    async findAll(): Promise<FestivoEntity[]> {
        try {
            const query = `
        SELECT * FROM festivo
        ORDER BY fecha ASC
      `;
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener los festivos: ${error.message}`
            );
        }
    }

    async findOne(id: number): Promise<FestivoEntity> {
        try {
            const query = `
        SELECT * FROM festivo
        WHERE id = $1
      `;
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Festivo con id ${id} no encontrado`);
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al obtener el festivo: ${error.message}`
            );
        }
    }

    async update(id: number, updateFestivoDto: UpdateFestivoDto): Promise<FestivoEntity> {
        // Verificar que existe
        await this.findOne(id);

        const { fecha, descripcion } = updateFestivoDto;

        try {
            const query = `
        UPDATE festivo
        SET
          fecha = COALESCE($1, fecha),
          descripcion = COALESCE($2, descripcion)
        WHERE id = $3
        RETURNING *
      `;
            const result = await this.pool.query(query, [fecha, descripcion, id]);
            return result.rows[0];
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al actualizar el festivo: ${error.message}`
            );
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        // Verificar que existe
        await this.findOne(id);

        try {
            const query = `DELETE FROM festivo WHERE id = $1`;
            await this.pool.query(query, [id]);
            return { message: `Festivo con id ${id} eliminado correctamente` };
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al eliminar el festivo: ${error.message}`
            );
        }
    }
}
