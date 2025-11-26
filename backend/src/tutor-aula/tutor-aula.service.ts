import { 
  Injectable, 
  Inject, 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { AsignarTutorDto, DesasignarTutorDto } from './dto';
import { TutorAulaEntity } from './entities/tutor-aula.entity';

@Injectable()
export class TutorAulaService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) {}

  async findTutoresActuales(id_aula: number): Promise<TutorAulaEntity[]> {
    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const query = `
        SELECT 
          ta.id_tutor,
          ta.id_aula,
          ta.consec,
          ta.fecha_asignado,
          ta.fecha_desasignado,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          CASE WHEN ta.fecha_desasignado IS NULL THEN true ELSE false END as activo
        FROM tutor_aula ta
        INNER JOIN personal p ON ta.id_tutor = p.id
        WHERE ta.id_aula = $1 AND ta.fecha_desasignado IS NULL
        ORDER BY ta.fecha_asignado DESC
      `;
      const result = await this.pool.query(query, [id_aula]);
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener los tutores actuales: ${error.message}`
      );
    }
  }

  async findTutoresHistorico(id_aula: number): Promise<TutorAulaEntity[]> {
    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const query = `
        SELECT 
          ta.id_tutor,
          ta.id_aula,
          ta.consec,
          ta.fecha_asignado,
          ta.fecha_desasignado,
          CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) as nombre_tutor,
          CASE WHEN ta.fecha_desasignado IS NULL THEN true ELSE false END as activo
        FROM tutor_aula ta
        INNER JOIN personal p ON ta.id_tutor = p.id
        WHERE ta.id_aula = $1
        ORDER BY ta.fecha_asignado DESC, ta.consec DESC
      `;
      const result = await this.pool.query(query, [id_aula]);
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener el histórico de tutores: ${error.message}`
      );
    }
  }

  async asignarTutor(
    id_aula: number,
    asignarTutorDto: AsignarTutorDto
  ): Promise<TutorAulaEntity> {
    const { id_tutor, fecha_asignado } = asignarTutorDto;

    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      // Verificar que el tutor existe y tiene el rol correcto
      const tutorQuery = `
        SELECT p.id, r.nombre as rol_nombre 
        FROM personal p
        INNER JOIN rol r ON p.id_rol = r.id
        WHERE p.id = $1
      `;
      const tutorResult = await this.pool.query(tutorQuery, [id_tutor]);

      if (tutorResult.rows.length === 0) {
        throw new NotFoundException(`Personal con id ${id_tutor} no encontrado`);
      }

      if (tutorResult.rows[0].rol_nombre !== 'TUTOR') {
        throw new BadRequestException(
          `El personal con id ${id_tutor} no tiene el rol de TUTOR`
        );
      }

      // Verificar si el aula ya tiene un tutor activo
      const tutorActivoQuery = `
        SELECT * FROM tutor_aula 
        WHERE id_aula = $1 AND fecha_desasignado IS NULL
      `;
      const tutorActivoResult = await this.pool.query(tutorActivoQuery, [id_aula]);

      if (tutorActivoResult.rows.length > 0) {
        throw new BadRequestException(
          `El aula ya tiene un tutor activo. Desasigne el tutor actual antes de asignar uno nuevo.`
        );
      }

      // Calcular el siguiente consecutivo para este tutor y aula
      const consecQuery = `
        SELECT COALESCE(MAX(consec), 0) + 1 as next_consec
        FROM tutor_aula
        WHERE id_tutor = $1 AND id_aula = $2
      `;
      const consecResult = await this.pool.query(consecQuery, [id_tutor, id_aula]);
      const consec = consecResult.rows[0].next_consec;

      // Crear la asignación
      const insertQuery = `
        INSERT INTO tutor_aula (id_tutor, id_aula, consec, fecha_asignado)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await this.pool.query(insertQuery, [
        id_tutor, 
        id_aula, 
        consec, 
        fecha_asignado
      ]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al asignar el tutor: ${error.message}`
      );
    }
  }

  async desasignarTutor(
    id_aula: number,
    id_tutor: number,
    desasignarTutorDto: DesasignarTutorDto
  ): Promise<TutorAulaEntity> {
    const { fecha_desasignado } = desasignarTutorDto;

    try {
      // Verificar que existe una asignación activa
      const asignacionQuery = `
        SELECT * FROM tutor_aula 
        WHERE id_tutor = $1 AND id_aula = $2 AND fecha_desasignado IS NULL
        ORDER BY consec DESC
        LIMIT 1
      `;
      const asignacionResult = await this.pool.query(asignacionQuery, [id_tutor, id_aula]);

      if (asignacionResult.rows.length === 0) {
        throw new NotFoundException(
          `No se encontró una asignación activa del tutor ${id_tutor} al aula ${id_aula}`
        );
      }

      const asignacion = asignacionResult.rows[0];

      // Validar que la fecha de desasignación sea posterior a la de asignación
      if (new Date(fecha_desasignado) < new Date(asignacion.fecha_asignado)) {
        throw new BadRequestException(
          'La fecha de desasignación no puede ser anterior a la fecha de asignación'
        );
      }

      // Actualizar la asignación
      const updateQuery = `
        UPDATE tutor_aula 
        SET fecha_desasignado = $1
        WHERE id_tutor = $2 AND id_aula = $3 AND consec = $4
        RETURNING *
      `;
      const result = await this.pool.query(updateQuery, [
        fecha_desasignado,
        id_tutor,
        id_aula,
        asignacion.consec
      ]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al desasignar el tutor: ${error.message}`
      );
    }
  }
}