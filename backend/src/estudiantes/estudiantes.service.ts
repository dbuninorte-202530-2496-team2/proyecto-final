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
  ) {}

  async findAll(): Promise<any[]> {
    const q = `SELECT id, codigo, nombre, apellidos, tipo_doc, numero_documento, fecha_nacimiento, grado, estado, score_in, score_out FROM estudiante ORDER BY apellidos, nombre`;
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
        (codigo, nombre, apellidos, tipo_doc, numero_documento, fecha_nacimiento, grado, estado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`;
      const params = [
        dto.codigo,
        dto.nombre,
        dto.apellidos,
        dto.tipo_doc,
        dto.numero_documento ?? null,
        dto.fecha_nacimiento ?? null,
        dto.grado ?? null,
        dto.estado ?? 'ACTIVO',
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
    // soft-delete: marcar estado INACTIVO
    try {
      const res = await this.pool.query(`UPDATE estudiante SET estado = 'INACTIVO' WHERE id = $1 RETURNING id`, [id]);
      if (res.rowCount === 0) throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
      return { message: `Estudiante ${id} marcado como INACTIVO` };
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
}
