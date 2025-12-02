import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateInstitucionDto, UpdateInstitucionDto } from './dto';

@Injectable()
export class InstitucionesService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) { }

  async create(createInstitucionDto: CreateInstitucionDto) {
    const { nombre, correo, jornada, nombre_contacto, telefono_contacto } = createInstitucionDto;

    try {
      const result = await this.pool.query(
        `INSERT INTO institucion (nombre, correo, jornada, nombre_contacto, telefono_contacto) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, nombre, correo, jornada, nombre_contacto, telefono_contacto`,
        [nombre, correo, jornada, nombre_contacto || null, telefono_contacto || null],
      );

      return result.rows[0];
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    try {
      const result = await this.pool.query(
        `SELECT id, nombre, correo, jornada, nombre_contacto, telefono_contacto 
         FROM institucion 
         ORDER BY nombre ASC`,
      );

      return result.rows;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.pool.query(
        `SELECT id, nombre, correo, jornada, nombre_contacto, telefono_contacto 
         FROM institucion 
         WHERE id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`Institución con id ${id} no encontrada`);
      }

      return result.rows[0];
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: number, updateInstitucionDto: UpdateInstitucionDto) {
    const { nombre, correo, jornada, nombre_contacto, telefono_contacto } = updateInstitucionDto;

    try {
      const currentInstitucion = await this.findOne(id);

      // Si se intenta cambiar la jornada, verificar si hay horarios asociados
      if (jornada && jornada !== currentInstitucion.jornada) {
        const horariosExistentes = await this.pool.query(
          `SELECT COUNT(*) as count
           FROM aula_horario_semana ahs
           INNER JOIN aula a ON ahs.id_aula = a.id
           INNER JOIN sede s ON a.id_sede = s.id
           WHERE s.id_inst = $1`,
          [id]
        );

        if (parseInt(horariosExistentes.rows[0].count) > 0) {
          throw new BadRequestException(
            'No se puede cambiar la jornada porque existen horarios de clases asignados.'
          );
        }
      }

      const result = await this.pool.query(
        `UPDATE institucion 
         SET nombre = COALESCE($1, nombre),
             correo = COALESCE($2, correo),
             jornada = COALESCE($3, jornada),
             nombre_contacto = COALESCE($4, nombre_contacto),
             telefono_contacto = COALESCE($5, telefono_contacto)
         WHERE id = $6 
         RETURNING id, nombre, correo, jornada, nombre_contacto, telefono_contacto`,
        [nombre, correo, jornada, nombre_contacto, telefono_contacto, id],
      );

      return result.rows[0];
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.pool.query(`DELETE FROM institucion WHERE id = $1`, [id]);

      return { message: `Institución con id ${id} eliminada correctamente` };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof NotFoundException) throw error;

    if (error.code === '23505') {
      throw new BadRequestException('Ya existe una institución con ese nombre');
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        'No se puede eliminar la institución porque tiene sedes o registros asociados',
      );
    }

    console.error(error);
    throw new InternalServerErrorException(
      'Error inesperado, revisa los logs del servidor',
    );
  }
}