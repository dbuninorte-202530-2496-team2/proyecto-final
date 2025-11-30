import {
    Injectable,
    Inject,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateMotivoDto } from './dto/create-motivo.dto';
import { UpdateMotivoDto } from './dto/update-motivo.dto';
import { MotivoEntity } from './entities/motivo.entity';

@Injectable()
export class MotivoService {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    async create(createMotivoDto: CreateMotivoDto): Promise<MotivoEntity> {
        const { descripcion } = createMotivoDto;

        try {
            const query = `
        INSERT INTO motivo (descripcion)
        VALUES ($1)
        RETURNING *
      `;
            const result = await this.pool.query(query, [descripcion]);
            return result.rows[0];
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al crear el motivo: ${error.message}`
            );
        }
    }

    async findAll(): Promise<MotivoEntity[]> {
        try {
            const query = `
        SELECT * FROM motivo
        ORDER BY id ASC
      `;
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener los motivos: ${error.message}`
            );
        }
    }

    async findOne(id: number): Promise<MotivoEntity> {
        try {
            const query = `
        SELECT * FROM motivo
        WHERE id = $1
      `;
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Motivo con id ${id} no encontrado`);
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al obtener el motivo: ${error.message}`
            );
        }
    }

    async update(id: number, updateMotivoDto: UpdateMotivoDto): Promise<MotivoEntity> {
        // Verificar que existe
        await this.findOne(id);

        const { descripcion } = updateMotivoDto;

        try {
            const query = `
        UPDATE motivo
        SET descripcion = COALESCE($1, descripcion)
        WHERE id = $2
        RETURNING *
      `;
            const result = await this.pool.query(query, [descripcion, id]);
            return result.rows[0];
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al actualizar el motivo: ${error.message}`
            );
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        // Verificar que existe
        await this.findOne(id);

        try {
            const query = `DELETE FROM motivo WHERE id = $1`;
            await this.pool.query(query, [id]);
            return { message: `Motivo con id ${id} eliminado correctamente` };
        } catch (error) {
            // Si hay foreign key constraint violation
            if (error.code === '23503') {
                throw new InternalServerErrorException(
                    'No se puede eliminar el motivo porque está siendo usado en asistencias'
                );
            }
            throw new InternalServerErrorException(
                `Error al eliminar el motivo: ${error.message}`
            );
        }
    }
}
