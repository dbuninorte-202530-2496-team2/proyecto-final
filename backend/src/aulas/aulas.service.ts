import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateAulaDto, UpdateAulaDto } from './dto';
import { SedesService } from '../sedes/sedes.service';

type TipoPrograma = 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM';

@Injectable()
export class AulasService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly sedesService: SedesService,
  ) {}

  private getTipoPrograma(grado: number): TipoPrograma {
    // Grados 4 y 5 -> INSIDECLASSROOM
    // Grados 9 y 10 -> OUTSIDECLASSROOM
    return grado === 4 || grado === 5 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM';
  }

  async create(createAulaDto: CreateAulaDto) {
    const { grado, grupo, id_sede } = createAulaDto;

    try {
      // Verificar que la sede existe
      await this.sedesService.findOne(id_sede);

      const result = await this.pool.query(
        `INSERT INTO aula (grado, grupo, id_sede) 
         VALUES ($1, $2, $3) 
         RETURNING id, grado, grupo, id_sede`,
        [grado, grupo, id_sede],
      );

      const aula = result.rows[0];
      
      // Agregar tipo_programa calculado
      return {
        ...aula,
        tipo_programa: this.getTipoPrograma(aula.grado),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    try {
      const result = await this.pool.query(
        `SELECT a.id, a.grado, a.grupo, a.id_sede,
                s.nombre as sede_nombre,
                i.nombre as institucion_nombre
         FROM aula a
         INNER JOIN sede s ON a.id_sede = s.id
         INNER JOIN institucion i ON s.id_inst = i.id
         ORDER BY i.nombre, s.nombre, a.grado, a.grupo ASC`,
      );

      // Agregar tipo_programa a cada aula
      return result.rows.map(aula => ({
        ...aula,
        tipo_programa: this.getTipoPrograma(aula.grado),
      }));
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.pool.query(
        `SELECT a.id, a.grado, a.grupo, a.id_sede,
                s.nombre as sede_nombre,
                i.nombre as institucion_nombre
         FROM aula a
         INNER JOIN sede s ON a.id_sede = s.id
         INNER JOIN institucion i ON s.id_inst = i.id
         WHERE a.id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id} no encontrada`);
      }

      const aula = result.rows[0];
      return {
        ...aula,
        tipo_programa: this.getTipoPrograma(aula.grado),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async findBySede(id_sede: number) {
    try {
      // Verificar que la sede existe
      await this.sedesService.findOne(id_sede);

      const result = await this.pool.query(
        `SELECT id, grado, grupo, id_sede
         FROM aula
         WHERE id_sede = $1
         ORDER BY grado, grupo ASC`,
        [id_sede],
      );

      return result.rows.map(aula => ({
        ...aula,
        tipo_programa: this.getTipoPrograma(aula.grado),
      }));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async findEstudiantes(id: number) {
    try {
      // Verificar que el aula existe
      await this.findOne(id);

      const result = await this.pool.query(
        `SELECT e.id, e.codigo, e.nombre, e.apellidos, 
                e.score_in, e.score_out
         FROM estudiante e
         INNER JOIN estudiante_aula ea ON e.id = ea.id_estudiante
         WHERE ea.id_aula = $1 
           AND ea.fecha_desasignado IS NULL
         ORDER BY e.apellidos, e.nombre ASC`,
        [id],
      );

      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async findTutoresHistorico(id: number) {
    try {
      // Verificar que el aula existe
      await this.findOne(id);

      const result = await this.pool.query(
        `SELECT p.id as id_tutor, p.nombre, p.apellido, 
                ta.consec,
                ta.fecha_asignado, 
                ta.fecha_desasignado
         FROM tutor_aula ta
         INNER JOIN personal p ON ta.id_tutor = p.id
         WHERE ta.id_aula = $1
         ORDER BY ta.fecha_asignado DESC`,
        [id],
      );

      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async update(id: number, updateAulaDto: UpdateAulaDto) {
    const { grado, grupo, id_sede } = updateAulaDto;

    try {
      await this.findOne(id);

      // Si se va a cambiar de sede, verificar que existe
      if (id_sede) {
        await this.sedesService.findOne(id_sede);
      }

      const result = await this.pool.query(
        `UPDATE aula 
         SET grado = COALESCE($1, grado),
             grupo = COALESCE($2, grupo),
             id_sede = COALESCE($3, id_sede)
         WHERE id = $4 
         RETURNING id, grado, grupo, id_sede`,
        [grado, grupo, id_sede, id],
      );

      const aula = result.rows[0];
      return {
        ...aula,
        tipo_programa: this.getTipoPrograma(aula.grado),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.pool.query(`DELETE FROM aula WHERE id = $1`, [id]);

      return { message: `Aula con id ${id} eliminada correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    console.error(error);

    if (error.code === '23505') {
      throw new BadRequestException('Ya existe un aula con ese grado y grupo en la sede');
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        'No se puede eliminar el aula porque tiene estudiantes o registros asociados',
      );
    }

    if (error.code === '23514') {
      throw new BadRequestException('El grado debe ser 4, 5, 9 o 10');
    }

    throw new InternalServerErrorException(
      'Error inesperado, revisa los logs del servidor',
    );
  }
}