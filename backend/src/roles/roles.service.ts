import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateRolDto, UpdateRolDto } from './dto';

@Injectable()
export class RolesService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async create(createRolDto: CreateRolDto) {
    const { nombre, descripcion } = createRolDto;

    try {
      const result = await this.pool.query(
        `INSERT INTO rol (nombre, descripcion) 
         VALUES ($1, $2) 
         RETURNING id, nombre, descripcion`,
        [nombre, descripcion || null],
      );

      return result.rows[0];
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    try {
      const result = await this.pool.query(
        `SELECT id, nombre, descripcion FROM rol ORDER BY id ASC`,
      );

      return result.rows;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.pool.query(
        `SELECT id, nombre, descripcion FROM rol WHERE id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`Rol con id ${id} no encontrado`);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const { nombre, descripcion } = updateRolDto;

    try {
      // Verificar que el rol existe
      await this.findOne(id);

      const result = await this.pool.query(
        `UPDATE rol 
         SET nombre = COALESCE($1, nombre), 
             descripcion = COALESCE($2, descripcion)
         WHERE id = $3 
         RETURNING id, nombre, descripcion`,
        [nombre, descripcion, id],
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    try {
      // Verificar que el rol existe
      await this.findOne(id);

      await this.pool.query(`DELETE FROM rol WHERE id = $1`, [id]);

      return { message: `Rol con id ${id} eliminado correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    console.error(error);

    if (error.code === '23505') {
      throw new BadRequestException(
        'Ya existe un rol con ese nombre',
      );
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        'No se puede eliminar el rol porque está siendo usado',
      );
    }

    throw new InternalServerErrorException(
      'Error inesperado, revisa los logs del servidor',
    );
  }
}