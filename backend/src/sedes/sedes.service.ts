import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateSedeDto, UpdateSedeDto } from './dto';
import { InstitucionesService } from '../instituciones/instituciones.service';

@Injectable()
export class SedesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly institucionesService: InstitucionesService,
  ) {}

  async create(createSedeDto: CreateSedeDto) {
    const { nombre, direccion, id_inst, is_principal } = createSedeDto;

    try {
      // Verificar que la institución existe
      await this.institucionesService.findOne(id_inst);

      const result = await this.pool.query(
        `INSERT INTO sede (nombre, direccion, id_inst, is_principal) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, nombre, direccion, id_inst, is_principal`,
        [nombre, direccion || null, id_inst, is_principal],
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    try {
      const result = await this.pool.query(
        `SELECT s.id, s.nombre, s.direccion, s.id_inst, s.is_principal,
                i.nombre as institucion_nombre
         FROM sede s
         INNER JOIN institucion i ON s.id_inst = i.id
         ORDER BY i.nombre, s.nombre ASC`,
      );

      return result.rows;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.pool.query(
        `SELECT s.id, s.nombre, s.direccion, s.id_inst, s.is_principal,
                i.nombre as institucion_nombre
         FROM sede s
         INNER JOIN institucion i ON s.id_inst = i.id
         WHERE s.id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`Sede con id ${id} no encontrada`);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async findByInstitucion(id_inst: number) {
    try {
      // Verificar que la institución existe
      await this.institucionesService.findOne(id_inst);

      const result = await this.pool.query(
        `SELECT id, nombre, direccion, id_inst, is_principal
         FROM sede
         WHERE id_inst = $1
         ORDER BY is_principal DESC, nombre ASC`,
        [id_inst],
      );

      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    const { nombre, direccion, id_inst, is_principal } = updateSedeDto;

    try {
      await this.findOne(id);

      // Si se va a cambiar de institución, verificar que existe
      if (id_inst) {
        await this.institucionesService.findOne(id_inst);
      }

      const result = await this.pool.query(
        `UPDATE sede 
         SET nombre = COALESCE($1, nombre),
             direccion = COALESCE($2, direccion),
             id_inst = COALESCE($3, id_inst),
             is_principal = COALESCE($4, is_principal)
         WHERE id = $5 
         RETURNING id, nombre, direccion, id_inst, is_principal`,
        [nombre, direccion, id_inst, is_principal, id],
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.pool.query(`DELETE FROM sede WHERE id = $1`, [id]);

      return { message: `Sede con id ${id} eliminada correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    console.error(error);

    if (error.code === '23505') {
      throw new BadRequestException('Ya existe una sede con ese nombre en la institución');
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        'No se puede eliminar la sede porque tiene aulas o registros asociados',
      );
    }

    throw new InternalServerErrorException(
      'Error inesperado, revisa los logs del servidor',
    );
  }
}