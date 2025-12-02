import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    ForbiddenException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { RegistrarNotaDto, GetNotasFilterDto, UpdateNotaDto } from './dto';
import { NotaEntity } from './entities/nota.entity';

@Injectable()
export class NotasService {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    async create(dto: RegistrarNotaDto): Promise<{ message: string }> {
        const { id_estudiante, id_componente, id_tutor, valor, comentario } = dto;

        try {
            await this.pool.query(
                'CALL sp_registrar_nota($1, $2, $3, $4, $5)',
                [id_estudiante, id_componente, id_tutor, valor, comentario]
            );

            return { message: 'Nota registrada exitosamente' };
        } catch (error) {
            // Manejo de errores del SP
            if (error.code === 'P0001') {
                const message = error.message;
                if (message.includes('no existe') || message.includes('no tiene aula')) {
                    throw new NotFoundException(message);
                }
                if (message.includes('no corresponde') || message.includes('entre 0 y 5')) {
                    throw new BadRequestException(message);
                }
                if (message.includes('no está autorizado')) {
                    throw new ForbiddenException(message);
                }
            }

            throw new InternalServerErrorException(
                `Error al registrar la nota: ${error.message}`
            );
        }
    }

    async findAll(filter: GetNotasFilterDto): Promise<NotaEntity[]> {
        try {
            let query = `
                SELECT n.* 
                FROM nota n
                JOIN componente c ON n.id_comp = c.id
                JOIN estudiante e ON n.id_estudiante = e.id
                LEFT JOIN estudiante_aula ea ON e.id = ea.id_estudiante
                WHERE 1=1
            `;
            const params: any[] = [];
            let paramIndex = 1;

            if (filter.id_estudiante) {
                query += ` AND n.id_estudiante = $${paramIndex}`;
                params.push(filter.id_estudiante);
                paramIndex++;
            }

            if (filter.id_componente) {
                query += ` AND n.id_comp = $${paramIndex}`;
                params.push(filter.id_componente);
                paramIndex++;
            }

            if (filter.id_periodo) {
                query += ` AND c.id_periodo = $${paramIndex}`;
                params.push(filter.id_periodo);
                paramIndex++;
            }

            if (filter.id_aula) {
                query += ` AND ea.id_aula = $${paramIndex} AND ea.fecha_desasignado IS NULL`;
                params.push(filter.id_aula);
                paramIndex++;
            }

            // Evitar duplicados si el estudiante ha estado en múltiples aulas (aunque el filtro de fecha_desasignado ayuda)
            query += ' GROUP BY n.id';

            const result = await this.pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener las notas: ${error.message}`
            );
        }
    }

    async findOne(id: number): Promise<NotaEntity> {
        try {
            const result = await this.pool.query('SELECT * FROM nota WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                throw new NotFoundException(`Nota con id ${id} no encontrada`);
            }
            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(`Error al obtener la nota: ${error.message}`);
        }
    }

    async update(id: number, dto: UpdateNotaDto): Promise<NotaEntity> {
        try {
            await this.findOne(id); // Verificar existencia

            const query = `
                UPDATE nota
                SET valor = $1, comentario = COALESCE($2, comentario)
                WHERE id = $3
                RETURNING *
            `;
            const result = await this.pool.query(query, [dto.valor, dto.comentario, id]);
            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(`Error al actualizar la nota: ${error.message}`);
        }
    }

}
