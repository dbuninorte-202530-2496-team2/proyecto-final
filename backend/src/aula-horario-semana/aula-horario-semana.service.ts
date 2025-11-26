import { 
  Injectable, 
  Inject, 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { AsignarHorarioAulaDto, CrearSesionEspecificaDto } from './dto';
import { AulaHorarioSemanaEntity } from './entities/aula-horario-semana.entity';

@Injectable()
export class AulaHorarioSemanaService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) {}

  async findHorariosByAula(id_aula: number): Promise<AulaHorarioSemanaEntity[]> {
    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const query = `
        SELECT 
          ahs.id_aula,
          ahs.id_horario,
          ahs.id_semana,
          h.dia_sem,
          h.hora_ini,
          h.hora_fin,
          s.fec_ini,
          s.fec_fin
        FROM aula_horario_sem ahs
        INNER JOIN horario h ON ahs.id_horario = h.id
        INNER JOIN semana s ON ahs.id_semana = s.id
        WHERE ahs.id_aula = $1
        ORDER BY s.fec_ini, h.dia_sem, h.hora_ini
      `;
      const result = await this.pool.query(query, [id_aula]);
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener los horarios del aula: ${error.message}`
      );
    }
  }

  async asignarHorario(
    id_aula: number, 
    asignarHorarioDto: AsignarHorarioAulaDto
  ): Promise<AulaHorarioSemanaEntity> {
    const { id_horario, id_semana } = asignarHorarioDto;

    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      // Verificar que el horario existe
      const horarioCheck = await this.pool.query('SELECT id FROM horario WHERE id = $1', [id_horario]);
      if (horarioCheck.rows.length === 0) {
        throw new NotFoundException(`Horario con id ${id_horario} no encontrado`);
      }

      // Verificar que la semana existe
      const semanaCheck = await this.pool.query('SELECT id FROM semana WHERE id = $1', [id_semana]);
      if (semanaCheck.rows.length === 0) {
        throw new NotFoundException(`Semana con id ${id_semana} no encontrada`);
      }

      // Verificar si ya existe esta asignación
      const existeQuery = `
        SELECT * FROM aula_horario_sem 
        WHERE id_aula = $1 AND id_horario = $2 AND id_semana = $3
      `;
      const existeResult = await this.pool.query(existeQuery, [id_aula, id_horario, id_semana]);

      if (existeResult.rows.length > 0) {
        throw new BadRequestException(
          `Ya existe una asignación de este horario al aula para esta semana`
        );
      }

      // Crear la asignación
      const insertQuery = `
        INSERT INTO aula_horario_sem (id_aula, id_horario, id_semana)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await this.pool.query(insertQuery, [id_aula, id_horario, id_semana]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al asignar el horario: ${error.message}`
      );
    }
  }

  async crearSesionEspecifica(
    id_aula: number,
    crearSesionDto: CrearSesionEspecificaDto
  ): Promise<{ message: string; asignacion: AulaHorarioSemanaEntity }> {
    const { id_horario, fecha } = crearSesionDto;

    try {
      // Verificar que el aula existe
      const aulaCheck = await this.pool.query('SELECT id FROM aula WHERE id = $1', [id_aula]);
      if (aulaCheck.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      // Verificar que el horario existe
      const horarioCheck = await this.pool.query('SELECT id FROM horario WHERE id = $1', [id_horario]);
      if (horarioCheck.rows.length === 0) {
        throw new NotFoundException(`Horario con id ${id_horario} no encontrado`);
      }

      // Buscar la semana que contiene esta fecha
      const semanaQuery = `
        SELECT id FROM semana 
        WHERE $1 BETWEEN fec_ini AND fec_fin
      `;
      const semanaResult = await this.pool.query(semanaQuery, [fecha]);

      if (semanaResult.rows.length === 0) {
        throw new BadRequestException(
          `No existe una semana que contenga la fecha ${fecha}. Verifique que el periodo tenga semanas generadas.`
        );
      }

      const id_semana = semanaResult.rows[0].id;

      // Verificar si ya existe esta asignación
      const existeQuery = `
        SELECT * FROM aula_horario_sem 
        WHERE id_aula = $1 AND id_horario = $2 AND id_semana = $3
      `;
      const existeResult = await this.pool.query(existeQuery, [id_aula, id_horario, id_semana]);

      if (existeResult.rows.length > 0) {
        throw new BadRequestException(
          `Ya existe una sesión para este aula, horario y semana`
        );
      }

      // Crear la sesión
      const insertQuery = `
        INSERT INTO aula_horario_sem (id_aula, id_horario, id_semana)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await this.pool.query(insertQuery, [id_aula, id_horario, id_semana]);

      return {
        message: `Sesión creada exitosamente para la fecha ${fecha} (semana ${id_semana})`,
        asignacion: result.rows[0],
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al crear la sesión específica: ${error.message}`
      );
    }
  }

  async eliminarAsignacion(
    id_aula: number,
    id_horario: number,
    id_semana: number
  ): Promise<{ message: string }> {
    try {
      // Verificar que la asignación existe
      const checkQuery = `
        SELECT * FROM aula_horario_sem 
        WHERE id_aula = $1 AND id_horario = $2 AND id_semana = $3
      `;
      const checkResult = await this.pool.query(checkQuery, [id_aula, id_horario, id_semana]);

      if (checkResult.rows.length === 0) {
        throw new NotFoundException(
          `No se encontró la asignación del horario ${id_horario} al aula ${id_aula} en la semana ${id_semana}`
        );
      }

      // Verificar si hay asistencias registradas para esta sesión
      const asistenciaCheck = await this.pool.query(
        `SELECT COUNT(*) as count FROM asistenciaTut 
         WHERE id_aula = $1 AND id_horario = $2 AND id_semana = $3`,
        [id_aula, id_horario, id_semana]
      );

      if (parseInt(asistenciaCheck.rows[0].count) > 0) {
        throw new BadRequestException(
          'No se puede eliminar la asignación porque tiene asistencias registradas'
        );
      }

      // Eliminar la asignación
      const deleteQuery = `
        DELETE FROM aula_horario_sem 
        WHERE id_aula = $1 AND id_horario = $2 AND id_semana = $3
      `;
      await this.pool.query(deleteQuery, [id_aula, id_horario, id_semana]);

      return { 
        message: `Asignación del horario ${id_horario} al aula ${id_aula} en la semana ${id_semana} eliminada correctamente` 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al eliminar la asignación: ${error.message}`
      );
    }
  }
}