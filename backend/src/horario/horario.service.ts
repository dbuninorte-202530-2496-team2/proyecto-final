import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { HorarioEntity } from './entities/horario.entity';

@Injectable()
export class HorarioService {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    async create(createHorarioDto: CreateHorarioDto): Promise<HorarioEntity> {
        const { dia_sem, hora_ini, hora_fin } = createHorarioDto;

        try {
            const query = `
        INSERT INTO horario (dia_sem, hora_ini, hora_fin)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
            const result = await this.pool.query(query, [dia_sem, hora_ini, hora_fin]);
            return result.rows[0];
        } catch (error) {
            // Unique constraint violation (dia_sem, hora_ini, hora_fin)
            if (error.code === '23505') {
                throw new BadRequestException(
                    `Ya existe un horario para ${dia_sem} de ${hora_ini} a ${hora_fin}`
                );
            }
            // Check constraint violation (duración inválida)
            if (error.code === '23514') {
                throw new BadRequestException(
                    'La duración del horario debe ser 40, 45, 50, 55 o 60 minutos'
                );
            }
            console.log(error)
            throw new InternalServerErrorException(
                `Error al crear el horario: ${error.message}`
            );
        }
    }

    async findAll(): Promise<HorarioEntity[]> {
        try {
            const query = `
        SELECT 
          id,
          dia_sem,
          hora_ini::text as hora_ini,
          hora_fin::text as hora_fin
        FROM horario
        ORDER BY 
          CASE dia_sem
            WHEN 'LU' THEN 1
            WHEN 'MA' THEN 2
            WHEN 'MI' THEN 3
            WHEN 'JU' THEN 4
            WHEN 'VI' THEN 5
            WHEN 'SA' THEN 6
          END,
          hora_ini ASC
      `;
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener los horarios: ${error.message}`
            );
        }
    }

    async findOne(id: number): Promise<HorarioEntity> {
        try {
            const query = `
        SELECT 
          id,
          dia_sem,
          hora_ini::text as hora_ini,
          hora_fin::text as hora_fin
        FROM horario
        WHERE id = $1
      `;
            const result = await this.pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new NotFoundException(`Horario con id ${id} no encontrado`);
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al obtener el horario: ${error.message}`
            );
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        // Verificar que existe
        await this.findOne(id);

        try {
            const query = `DELETE FROM horario WHERE id = $1`;
            await this.pool.query(query, [id]);
            return { message: `Horario con id ${id} eliminado correctamente` };
        } catch (error) {
            // Foreign key constraint violation (usado en aula_horario_sem o asistencias)
            if (error.code === '23503') {
                throw new BadRequestException(
                    'No se puede eliminar el horario porque está siendo usado en aulas o asistencias'
                );
            }
            throw new InternalServerErrorException(
                `Error al eliminar el horario: ${error.message}`
            );
        }
    }

    // Nota: No se incluye update() porque la tabla horario es INMUTABLE según el schema
    // El trigger trg_horario_immutable bloquea cualquier UPDATE
}
