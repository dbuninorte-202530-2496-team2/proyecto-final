import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

@Injectable()
export class EstudiantesService {
  constructor(
    @Inject(PG_CONNECTION)
    private readonly pool: Pool,
  ) { }

  async findAll(): Promise<any[]> {
    // Include current aula using LEFT JOIN
    const q = `
      SELECT 
        e.id, e.codigo, e.nombre, e.apellidos, e.tipo_doc, e.score_in, e.score_out,
        ea.id_aula as aula_actual_id
      FROM estudiante e
      LEFT JOIN estudiante_aula ea ON e.id = ea.id_estudiante 
        AND ea.fecha_desasignado IS NULL
      ORDER BY e.apellidos, e.nombre
    `;
    const res = await this.pool.query(q);
    return res.rows;
  }

  async findOne(id: number): Promise<any> {
    const res = await this.pool.query('SELECT * FROM estudiante WHERE id = $1', [id]);
    if (res.rowCount === 0) {
      throw new HttpException(`Estudiante con id ${id} no encontrado`, HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  async create(dto: CreateEstudianteDto): Promise<any> {
    try {
      const q = `
        INSERT INTO estudiante
        (codigo, nombre, apellidos, tipo_doc, score_in, score_out)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`;
      const params = [
        dto.codigo,
        dto.nombre,
        dto.apellidos,
        dto.tipo_doc,
        dto.score_in ?? null,
        dto.score_out ?? null,
      ];
      const res = await this.pool.query(q, params);
      return res.rows[0];
    } catch (err) {
      // Si hay violación de constraint específica puedes mapear el mensaje
      throw new HttpException(err.message || 'Error creando estudiante', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, dto: UpdateEstudianteDto): Promise<any> {
    // dynamic update builder
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [k, v] of Object.entries(dto)) {
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx++;
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    values.push(id);

    const q = `UPDATE estudiante SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    try {
      const res = await this.pool.query(q, values);
      if (res.rowCount === 0) throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
      return res.rows[0];
    } catch (err) {
      throw new HttpException(err.message || 'Error actualizando estudiante', HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const res = await this.pool.query(`DELETE FROM estudiante WHERE id = $1 RETURNING id`, [id]);
      if (res.rowCount === 0) throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
      return { message: `Estudiante ${id} eliminado` };
    } catch (err) {
      throw new HttpException(err.message || 'Error eliminando estudiante', HttpStatus.BAD_REQUEST);
    }
  }

  async updateScores(id: number, dto: UpdateScoreDto): Promise<any> {
    try {
      const q = `UPDATE estudiante SET score_in = COALESCE($1, score_in), score_out = COALESCE($2, score_out) WHERE id = $3 RETURNING *`;
      const res = await this.pool.query(q, [dto.score_in ?? null, dto.score_out ?? null, id]);
      if (res.rowCount === 0) throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
      return res.rows[0];
    } catch (err) {
      throw new HttpException(err.message || 'Error actualizando scores', HttpStatus.BAD_REQUEST);
    }
  }

  // Métodos para gestión de aulas usando stored procedures

  async asignarAula(idEstudiante: number, idAula: number, fechaAsignado?: string): Promise<{ message: string }> {
    try {
      const fecha = fechaAsignado || new Date().toISOString().split('T')[0];
      await this.pool.query(
        'CALL sp_asignar_estudiante_aula($1, $2, $3)',
        [idEstudiante, idAula, fecha]
      );
      return { message: `Estudiante ${idEstudiante} asignado al aula ${idAula}` };
    } catch (err) {
      throw new HttpException(err.message || 'Error asignando aula', HttpStatus.BAD_REQUEST);
    }
  }

  async moverAula(idEstudiante: number, idAulaDestino: number, fechaMovimiento?: string): Promise<{ message: string }> {
    try {
      const fecha = fechaMovimiento || new Date().toISOString().split('T')[0];
      await this.pool.query(
        'CALL sp_mover_estudiante_aula($1, $2, $3)',
        [idEstudiante, idAulaDestino, fecha]
      );
      return { message: `Estudiante ${idEstudiante} movido al aula ${idAulaDestino}` };
    } catch (err) {
      throw new HttpException(err.message || 'Error moviendo estudiante de aula', HttpStatus.BAD_REQUEST);
    }
  }

  async obtenerAulaActual(idEstudiante: number): Promise<{ id_aula: number | null }> {
    try {
      const res = await this.pool.query(
        'SELECT fn_obtener_aula_actual_estudiante($1) as id_aula',
        [idEstudiante]
      );
      return { id_aula: res.rows[0]?.id_aula || null };
    } catch (err) {
      throw new HttpException(err.message || 'Error obteniendo aula actual', HttpStatus.BAD_REQUEST);
    }
  }
}
