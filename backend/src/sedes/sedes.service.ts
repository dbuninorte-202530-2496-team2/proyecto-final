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
  ) { }

  async create(createSedeDto: CreateSedeDto) {
    const { nombre, direccion, id_inst, is_principal } = createSedeDto;

    try {
      // Verificar que la institución existe
      await this.institucionesService.findOne(id_inst);

      // Si es principal, verificar que no exista otra principal para esta institución
      if (is_principal) {
        const principalExistente = await this.pool.query(
          `SELECT id FROM sede WHERE id_inst = $1 AND is_principal = true`,
          [id_inst]
        );

        if (principalExistente.rows.length > 0) {
          throw new BadRequestException(
            'Ya existe una sede principal para esta institución. Solo puede haber una.'
          );
        }
      }

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
      this.handleDBExceptions(error);
    }
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    const { nombre, direccion, id_inst, is_principal } = updateSedeDto;

    try {
      const currentSede = await this.findOne(id);
      const targetInstId = id_inst || currentSede.id_inst;

      // Si se va a cambiar de institución, verificar que existe
      if (id_inst) {
        await this.institucionesService.findOne(id_inst);
      }

      // Si se marca como principal, verificar unicidad
      // (Solo si cambia a true, o si cambia de institución siendo true)
      const isBecomingPrincipal = is_principal === true && !currentSede.is_principal;
      const isMovingInstitutionAsPrincipal = (is_principal === true || (is_principal === undefined && currentSede.is_principal)) && id_inst && id_inst !== currentSede.id_inst;

      if (isBecomingPrincipal || isMovingInstitutionAsPrincipal) {
        const principalExistente = await this.pool.query(
          `SELECT id FROM sede WHERE id_inst = $1 AND is_principal = true AND id != $2`,
          [targetInstId, id]
        );

        if (principalExistente.rows.length > 0) {
          throw new BadRequestException(
            'Ya existe una sede principal para esta institución.'
          );
        }
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
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    try {
      const sede = await this.findOne(id);

      if (sede.is_principal) {
        throw new BadRequestException(
          'No se puede eliminar la sede principal. Debe asignar otra sede como principal antes de eliminar esta.',
        );
      }

      await this.pool.query(`DELETE FROM sede WHERE id = $1`, [id]);

      return { message: `Sede con id ${id} eliminada correctamente` };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof NotFoundException) throw error;

    if (error.code === '23505') {
      throw new BadRequestException('Ya existe una sede con este nombre en la institución');
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        'No se puede eliminar la sede porque tiene aulas o registros asociados',
      );
    }

    console.error(error);
    throw new InternalServerErrorException(
      'Error inesperado, revisa los logs del servidor',
    );
  }
}