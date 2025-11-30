import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateTipoDocumentoDto, UpdateTipoDocumentoDto } from './dto';
import { TipoDocumentoEntity } from './entities/tipo-documento.entity';

@Injectable()
export class TipoDocumentoService {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    async create(createTipoDocumentoDto: CreateTipoDocumentoDto): Promise<TipoDocumentoEntity> {
        const { codigo, descripcion } = createTipoDocumentoDto;

        try {
            const query = `
        INSERT INTO tipoDocumento (codigo, descripcion)
        VALUES ($1, $2)
        RETURNING *
      `;
            const result = await this.pool.query(query, [codigo, descripcion]);
            return result.rows[0];
        } catch (error) {
            // Unique constraint violation (si existiera)
            if (error.code === '23505') {
                throw new BadRequestException(
                    `Ya existe un tipo de documento con código ${codigo}`
                );
            }
            throw new InternalServerErrorException(
                `Error al crear el tipo de documento: ${error.message}`
            );
        }
    }

    async findAll(): Promise<TipoDocumentoEntity[]> {
        try {
            const query = `
        SELECT * FROM tipoDocumento
        ORDER BY codigo ASC
      `;
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener los tipos de documento: ${error.message}`
            );
        }
    }

    async findOne(id: number): Promise<TipoDocumentoEntity> {
        try {
            const query = `
        SELECT * FROM tipoDocumento
        WHERE id = $1
      `;
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Tipo de documento con id ${id} no encontrado`);
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al obtener el tipo de documento: ${error.message}`
            );
        }
    }

    async update(id: number, updateTipoDocumentoDto: UpdateTipoDocumentoDto): Promise<TipoDocumentoEntity> {
        // Verificar que existe
        await this.findOne(id);

        const { codigo, descripcion } = updateTipoDocumentoDto;

        try {
            const query = `
        UPDATE tipoDocumento
        SET
          codigo = COALESCE($1, codigo),
          descripcion = COALESCE($2, descripcion)
        WHERE id = $3
        RETURNING *
      `;
            const result = await this.pool.query(query, [codigo, descripcion, id]);
            return result.rows[0];
        } catch (error) {
            // Unique constraint violation
            if (error.code === '23505') {
                throw new BadRequestException(
                    `Ya existe un tipo de documento con código ${codigo}`
                );
            }
            throw new InternalServerErrorException(
                `Error al actualizar el tipo de documento: ${error.message}`
            );
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        // Verificar que existe
        await this.findOne(id);

        try {
            const query = `DELETE FROM tipoDocumento WHERE id = $1`;
            await this.pool.query(query, [id]);
            return { message: `Tipo de documento con id ${id} eliminado correctamente` };
        } catch (error) {
            // Foreign key constraint violation (usado en personal o estudiante)
            if (error.code === '23503') {
                throw new BadRequestException(
                    'No se puede eliminar el tipo de documento porque está siendo usado por personal o estudiantes'
                );
            }
            throw new InternalServerErrorException(
                `Error al eliminar el tipo de documento: ${error.message}`
            );
        }
    }
}
