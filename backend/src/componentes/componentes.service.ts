import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateComponenteDto, UpdateComponenteDto } from './dto';
import { ComponenteEntity } from './entities/componente.entity';

@Injectable()
export class ComponentesService {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    async create(createComponenteDto: CreateComponenteDto): Promise<ComponenteEntity> {
        const { nombre, tipo_programa, porcentaje, id_periodo } = createComponenteDto;

        try {
            const query = `
        INSERT INTO componente(nombre, tipo_programa, porcentaje, id_periodo)
VALUES($1, $2, $3, $4)
RETURNING *
    `;
            const result = await this.pool.query(query, [nombre, tipo_programa, porcentaje, id_periodo]);

            return result.rows[0];
        } catch (error) {
            // Capturar error de la suma de porcentajes del trigger
            if (error.code === 'P0001' && error.message.includes('suma de porcentajes')) {
                throw new BadRequestException(error.message);
            }

            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al crear el componente: ${error.message} `
            );
        }
    }



    async findAllByPeriodo(id_periodo: number, tipo_programa?: number): Promise<ComponenteEntity[]> {
        try {
            let query = 'SELECT * FROM componente WHERE id_periodo = $1';
            const params: any[] = [id_periodo];

            if (tipo_programa) {
                query += ' AND tipo_programa = $2';
                params.push(tipo_programa);
            }

            query += ' ORDER BY tipo_programa, id';

            const result = await this.pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener los componentes: ${error.message} `
            );
        }
    }

    async findOne(id: number): Promise<ComponenteEntity> {
        try {
            const query = 'SELECT * FROM componente WHERE id = $1';
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Componente con id ${id} no encontrado`);
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al obtener el componente: ${error.message} `
            );
        }
    }

    async update(id: number, updateComponenteDto: UpdateComponenteDto): Promise<ComponenteEntity> {
        const { nombre, porcentaje } = updateComponenteDto;

        try {
            // Verificar existencia
            await this.findOne(id);

            const query = `
        UPDATE componente
SET
nombre = COALESCE($1, nombre),
    porcentaje = COALESCE($2, porcentaje)
        WHERE id = $3
RETURNING *
    `;
            const result = await this.pool.query(query, [nombre, porcentaje, id]);

            return result.rows[0];
        } catch (error) {
            // Capturar error del trigger
            if (error.code === 'P0001' && error.message.includes('suma de porcentajes')) {
                throw new BadRequestException(error.message);
            }

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al actualizar el componente: ${error.message} `
            );
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const result = await this.pool.query(
                'DELETE FROM componente WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rowCount === 0) {
                throw new NotFoundException(`No existe el componente con id ${id} `);
            }

            return { message: `Componente con id ${id} eliminado correctamente` };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === '23503') { // FK violation
                throw new BadRequestException('No se puede eliminar el componente porque tiene notas asociadas');
            }
            throw new InternalServerErrorException(
                `Error al eliminar el componente: ${error.message} `
            );
        }
    }
}
