import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import { AsignarHorarioAulaDto, CrearSesionEspecificaDto, AsignarHorarioBulkDto } from './dto';
import { AulaHorarioSemanaEntity } from './entities/aula-horario-semana.entity';

@Injectable()
export class AulaHorarioSemanaService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) { }

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
          ahs.fecha_programada,
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
      // Obtener información completa del aula (grado, tipo_programa, jornada institución)
      const aulaQuery = `
        SELECT 
          a.id,
          a.grado,
          a.tipo_programa,
          i.jornada
        FROM aula a
        INNER JOIN sede s ON a.id_sede = s.id
        INNER JOIN institucion i ON s.id_inst = i.id
        WHERE a.id = $1
      `;
      const aulaResult = await this.pool.query(aulaQuery, [id_aula]);

      if (aulaResult.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const aula = aulaResult.rows[0];
      const tipoPrograma = aula.tipo_programa; // 1: INSIDE, 2: OUTSIDE
      const jornada = aula.jornada; // UNICA_MANANA, UNICA_TARDE, MANANA_Y_TARDE

      // Obtener información del horario
      const horarioQuery = `
        SELECT 
          id, 
          dia_sem, 
          hora_ini::text as hora_ini, 
          hora_fin::text as hora_fin
        FROM horario 
        WHERE id = $1
      `;
      const horarioResult = await this.pool.query(horarioQuery, [id_horario]);

      if (horarioResult.rows.length === 0) {
        throw new NotFoundException(`Horario con id ${id_horario} no encontrado`);
      }

      const horario = horarioResult.rows[0];
      const diaSem = horario.dia_sem;
      const horaIni = horario.hora_ini;
      const horaFin = horario.hora_fin;

      // Validar según tipo de programa
      if (tipoPrograma === 1) {
        // INSIDECLASSROOM (4° y 5°)
        await this.validarHorarioINSIDE(diaSem, horaIni, horaFin, jornada);
      } else if (tipoPrograma === 2) {
        // OUTSIDECLASSROOM (9° y 10°)
        await this.validarHorarioOUTSIDE(diaSem, horaIni, horaFin, jornada);
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

      // Validar intensidad horaria semanal
      await this.validarIntensidadHoraria(id_aula, id_semana, tipoPrograma);

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

  /**
   * Valida horarios para INSIDECLASSROOM (4° y 5°)
   * - Lunes a viernes
   * - 06:00 a 18:00
   * - Respeta jornada de la institución
   */
  private async validarHorarioINSIDE(
    diaSem: string,
    horaIni: string,
    horaFin: string,
    jornada: string
  ): Promise<void> {
    // Validar días permitidos (lunes a viernes)
    if (!['LU', 'MA', 'MI', 'JU', 'VI'].includes(diaSem)) {
      throw new BadRequestException(
        `INSIDECLASSROOM (4° y 5°) solo permite lunes a viernes. Día recibido: ${diaSem}`
      );
    }

    // Validar rango general 06:00 - 18:00
    if (horaIni < '06:00' || horaFin > '18:00') {
      throw new BadRequestException(
        `INSIDECLASSROOM debe estar entre 06:00 y 18:00. Horario recibido: ${horaIni} - ${horaFin}`
      );
    }

    // Validar según jornada de la institución
    if (jornada === 'UNICA_MANANA') {
      // Jornada mañana: 06:00 - 12:00
      if (horaIni < '06:00' || horaFin > '12:00') {
        throw new BadRequestException(
          `La institución tiene jornada ÚNICA MAÑANA (06:00-12:00). Horario recibido: ${horaIni} - ${horaFin}`
        );
      }
    } else if (jornada === 'UNICA_TARDE') {
      // Jornada tarde: 12:00 - 18:00
      if (horaIni < '12:00' || horaFin > '18:00') {
        throw new BadRequestException(
          `La institución tiene jornada ÚNICA TARDE (12:00-18:00). Horario recibido: ${horaIni} - ${horaFin}`
        );
      }
    } else if (jornada === 'MANANA_Y_TARDE') {
      // Jornada mixta: puede usar todo el rango 06:00 - 18:00
      // Ya validado arriba
    } else {
      throw new BadRequestException(
        `Jornada de institución no reconocida: ${jornada}`
      );
    }
  }

  /**
   * Valida horarios para OUTSIDECLASSROOM (9° y 10°)
   * - Lunes a sábado
   * - Jornada contraria a la institución
   */
  private async validarHorarioOUTSIDE(
    diaSem: string,
    horaIni: string,
    horaFin: string,
    jornada: string
  ): Promise<void> {
    // Validar días permitidos (lunes a sábado)
    if (!['LU', 'MA', 'MI', 'JU', 'VI', 'SA'].includes(diaSem)) {
      throw new BadRequestException(
        `OUTSIDECLASSROOM (9° y 10°) solo permite lunes a sábado. Día recibido: ${diaSem}`
      );
    }

    // Validar duración máxima (3 horas = 180 minutos)
    const [horaIniH, horaIniM] = horaIni.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
    const duracionMinutos = (horaFinH * 60 + horaFinM) - (horaIniH * 60 + horaIniM);

    if (duracionMinutos > 180) {
      throw new BadRequestException(
        `OUTSIDECLASSROOM no puede exceder 3 horas (180 min). Duración: ${duracionMinutos} min`
      );
    }

    // Validar jornada contraria
    if (jornada === 'UNICA_MANANA') {
      // Jornada contraria es TARDE: 12:00 - 18:00
      if (horaIni < '12:00' || horaFin > '18:00') {
        throw new BadRequestException(
          `La institución es jornada ÚNICA MAÑANA, OUTSIDECLASSROOM debe ser en jornada contraria (TARDE: 12:00-18:00). Horario recibido: ${horaIni} - ${horaFin}`
        );
      }
    } else if (jornada === 'UNICA_TARDE') {
      // Jornada contraria es MAÑANA: 06:00 - 12:00
      if (horaIni < '06:00' || horaFin > '12:00') {
        throw new BadRequestException(
          `La institución es jornada ÚNICA TARDE, OUTSIDECLASSROOM debe ser en jornada contraria (MAÑANA: 06:00-12:00). Horario recibido: ${horaIni} - ${horaFin}`
        );
      }
    } else if (jornada === 'MANANA_Y_TARDE') {
      // Siempre validar que esté dentro de la ventana global del programa
      if (horaIni < '06:00' || horaFin > '18:00') {
        throw new BadRequestException(
          `El programa solo permite horarios entre 06:00 y 18:00. Recibido: ${horaIni} - ${horaFin}`
        );
      }

      // Lunes a viernes: debe ser fuera de 06:00–18:00
      if (diaSem !== 'SA') {
        const dentroJornadaNormal =
          horaIni >= '06:00' && horaFin <= '18:00';

        if (dentroJornadaNormal) {
          throw new BadRequestException(
            `La institución es jornada MIXTA (MAÑANA y TARDE). De lunes a viernes OUTSIDECLASSROOM debe ser fuera de la jornada normal (06:00–18:00).`
          );
        }
      }

      // Sábado ('SA'): permitido dentro de 06:00–18:00
    } else {
      throw new BadRequestException(
        `Jornada de institución no reconocida: ${jornada}`
      );
    }
  }

  async crearSesionEspecifica(
    id_aula: number,
    crearSesionDto: CrearSesionEspecificaDto
  ): Promise<{ message: string; asignacion: AulaHorarioSemanaEntity }> {
    const { id_horario, fecha } = crearSesionDto;

    try {
      // Obtener información completa del aula (igual que en asignarHorario)
      const aulaQuery = `
        SELECT 
          a.id,
          a.grado,
          a.tipo_programa,
          i.jornada
        FROM aula a
        INNER JOIN sede s ON a.id_sede = s.id
        INNER JOIN institucion i ON s.id_inst = i.id
        WHERE a.id = $1
      `;
      const aulaResult = await this.pool.query(aulaQuery, [id_aula]);

      if (aulaResult.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const aula = aulaResult.rows[0];
      const tipoPrograma = aula.tipo_programa;
      const jornada = aula.jornada;

      // Obtener información del horario
      const horarioQuery = `
        SELECT 
          id, 
          dia_sem, 
          hora_ini::text as hora_ini, 
          hora_fin::text as hora_fin
        FROM horario 
        WHERE id = $1
      `;
      const horarioResult = await this.pool.query(horarioQuery, [id_horario]);

      if (horarioResult.rows.length === 0) {
        throw new NotFoundException(`Horario con id ${id_horario} no encontrado`);
      }

      const horario = horarioResult.rows[0];
      const diaSem = horario.dia_sem;
      const horaIni = horario.hora_ini;
      const horaFin = horario.hora_fin;

      // Validar según tipo de programa (igual que en asignarHorario)
      if (tipoPrograma === 1) {
        await this.validarHorarioINSIDE(diaSem, horaIni, horaFin, jornada);
      } else if (tipoPrograma === 2) {
        await this.validarHorarioOUTSIDE(diaSem, horaIni, horaFin, jornada);
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

      // Validar intensidad horaria semanal
      await this.validarIntensidadHoraria(id_aula, id_semana, tipoPrograma);

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

  private async validarIntensidadHoraria(
    id_aula: number,
    id_semana: number,
    tipoPrograma: number
  ): Promise<void> {
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM aula_horario_sem 
      WHERE id_aula = $1 AND id_semana = $2
    `;
    const countResult = await this.pool.query(countQuery, [id_aula, id_semana]);
    const horasAsignadas = parseInt(countResult.rows[0].count, 10);

    // +1 porque estamos intentando agregar una nueva
    const horasTotales = horasAsignadas + 1;

    if (tipoPrograma === 1) { // INSIDECLASSROOM (4° y 5°)
      if (horasTotales > 2) {
        throw new BadRequestException(
          `INSIDECLASSROOM solo permite máximo 2 horas semanales. Actualmente tiene ${horasAsignadas} horas.`
        );
      }
    } else if (tipoPrograma === 2) { // OUTSIDECLASSROOM (9° y 10°)
      if (horasTotales > 3) {
        throw new BadRequestException(
          `OUTSIDECLASSROOM solo permite máximo 3 horas semanales. Actualmente tiene ${horasAsignadas} horas.`
        );
      }
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

  async findAsignacionesBySemana(id_semana: number): Promise<AulaHorarioSemanaEntity[]> {
    try {
      // Verificar que la semana existe
      const semanaCheck = await this.pool.query('SELECT id FROM semana WHERE id = $1', [id_semana]);
      if (semanaCheck.rows.length === 0) {
        throw new NotFoundException(`Semana con id ${id_semana} no encontrada`);
      }

      const query = `
        SELECT 
          ahs.id_aula,
          ahs.id_horario,
          ahs.id_semana,
          ahs.fecha_programada,
          h.dia_sem,
          h.hora_ini,
          h.hora_fin
        FROM aula_horario_sem ahs
        INNER JOIN horario h ON ahs.id_horario = h.id
        WHERE ahs.id_semana = $1
        ORDER BY h.dia_sem, h.hora_ini
      `;
      const result = await this.pool.query(query, [id_semana]);
      return result.rows;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener las asignaciones de la semana: ${error.message}`
      );
    }
  }

  async asignarHorarioBulk(
    id_aula: number,
    asignarHorarioBulkDto: AsignarHorarioBulkDto
  ): Promise<{ message: string; asignaciones_creadas: number; id_horario: number; id_periodo: number }> {
    const { id_horario, id_periodo } = asignarHorarioBulkDto;

    try {
      // Verificar que el aula existe y obtener info
      const aulaQuery = `
        SELECT a.id, a.tipo_programa, i.jornada
        FROM aula a
        INNER JOIN sede s ON a.id_sede = s.id
        INNER JOIN institucion i ON s.id_inst = i.id
        WHERE a.id = $1
      `;
      const aulaResult = await this.pool.query(aulaQuery, [id_aula]);
      if (aulaResult.rows.length === 0) {
        throw new NotFoundException(`Aula con id ${id_aula} no encontrada`);
      }

      const aula = aulaResult.rows[0];
      const tipoPrograma = aula.tipo_programa;
      const jornada = aula.jornada;

      // Verificar horario
      const horarioQuery = `
        SELECT id, dia_sem, hora_ini::text as hora_ini, hora_fin::text as hora_fin
        FROM horario 
        WHERE id = $1
      `;
      const horarioResult = await this.pool.query(horarioQuery, [id_horario]);
      if (horarioResult.rows.length === 0) {
        throw new NotFoundException(`Horario con id ${id_horario} no encontrado`);
      }

      const horario = horarioResult.rows[0];
      const diaSem = horario.dia_sem;
      const horaIni = horario.hora_ini;
      const horaFin = horario.hora_fin;

      // Validar horario
      if (tipoPrograma === 1) {
        await this.validarHorarioINSIDE(diaSem, horaIni, horaFin, jornada);
      } else if (tipoPrograma === 2) {
        await this.validarHorarioOUTSIDE(diaSem, horaIni, horaFin, jornada);
      }

      // Obtener todas las semanas del periodo
      const semanasQuery = `
        SELECT id FROM semana 
        WHERE id_periodo = $1
        ORDER BY fec_ini
      `;
      const semanasResult = await this.pool.query(semanasQuery, [id_periodo]);
      if (semanasResult.rows.length === 0) {
        throw new NotFoundException(`No se encontraron semanas para el periodo ${id_periodo}`);
      }

      const semanas = semanasResult.rows.map(r => r.id);
      let asignacionesCreadas = 0;

      // Transaction para crear todas las asignaciones
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        for (const id_semana of semanas) {
          // Verificar si ya existe
          const existeQuery = `
            SELECT * FROM aula_horario_sem 
            WHERE id_aula = $1 AND id_horario = $2 AND id_semana = $3
          `;
          const existeResult = await client.query(existeQuery, [id_aula, id_horario, id_semana]);

          if (existeResult.rows.length === 0) {
            // No existe, crear
            const insertQuery = `
              INSERT INTO aula_horario_sem (id_aula, id_horario, id_semana)
              VALUES ($1, $2, $3)
            `;
            await client.query(insertQuery, [id_aula, id_horario, id_semana]);
            asignacionesCreadas++;
          }
          // Si ya existe, skipear
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      return {
        message: `Horario asignado a ${asignacionesCreadas} semanas exitosamente`,
        asignaciones_creadas: asignacionesCreadas,
        id_horario,
        id_periodo,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al asignar horario masivamente: ${error.message}`
      );
    }
  }
}