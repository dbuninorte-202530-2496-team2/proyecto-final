import {
    Injectable,
    Inject,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    HttpException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';

@Injectable()
export class ReportesService {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    async obtenerBoletin(id_estudiante: number): Promise<any[]> {
        try {
            // Verificar existencia del estudiante
            const { rows: est } = await this.pool.query(
                'SELECT 1 FROM estudiante WHERE id = $1',
                [id_estudiante]
            );

            if (est.length === 0) {
                throw new NotFoundException(
                    `Estudiante con id ${id_estudiante} no encontrado`
                );
            }

            // Ejecutar función corregida: solo un parámetro
            const result = await this.pool.query(
                'SELECT * FROM fn_boletin_estudiante($1)',
                [id_estudiante]
            );

            return result.rows;
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;

            if (error.code === 'P0001') {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException(
                `Error al obtener boletín: ${error.message}`
            );
        }
    }



    async obtenerAsistenciaAula(id_aula: number, fecha_inicio?: string, fecha_fin?: string): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_reporte_asistencia_aula($1, $2, $3)';
            const result = await this.pool.query(query, [id_aula, fecha_inicio || null, fecha_fin || null]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(`Error al obtener reporte de asistencia de aula: ${error.message}`);
        }
    }

    async obtenerAsistenciaEstudiante(id_estudiante: number, fecha_inicio?: string, fecha_fin?: string): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_reporte_asistencia_estudiante($1, $2, $3)';
            const result = await this.pool.query(query, [id_estudiante, fecha_inicio || null, fecha_fin || null]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(`Error al obtener reporte de asistencia de estudiante: ${error.message}`);
        }
    }

    async obtenerNotasTutor(id_tutor: number): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_reporte_notas_tutor($1)';
            const result = await this.pool.query(query, [id_tutor]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(`Error al obtener reporte de notas del tutor: ${error.message}`);
        }
    }

    async obtenerAsistenciaTutor(id_tutor: number, fecha_inicio?: string, fecha_fin?: string): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_reporte_asistencia_tutor($1, $2, $3)';
            const result = await this.pool.query(query, [id_tutor, fecha_inicio || null, fecha_fin || null]);
            return result.rows;
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(`Error al obtener reporte de asistencia del tutor: ${error.message}`);
        }
    }


    async obtenerHorarioTutor(id_tutor: number, id_periodo: number): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_horario_tutor($1, $2)';
            const result = await this.pool.query(query, [id_tutor, id_periodo]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(`Error al obtener horario del tutor: ${error.message}`);
        }
    }

    async obtenerEstadisticasAsistenciaAula(id_aula: number, id_periodo: number): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_estadisticas_asistencia_aula($1, $2)';
            const result = await this.pool.query(query, [id_aula, id_periodo]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(`Error al obtener estadísticas de asistencia de aula: ${error.message}`);
        }
    }

    async obtenerEstadisticasAsistenciaEstudiantesAula(id_aula: number, id_periodo: number): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_estadisticas_asistencia_estudiantes_aula($1, $2)';
            const result = await this.pool.query(query, [id_aula, id_periodo]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(`Error al obtener estadísticas de asistencia de estudiantes: ${error.message}`);
        }
    }

    async obtenerNotasAulaComponente(id_aula: number, id_componente: number): Promise<any[]> {
        try {
            const query = `
        SELECT 
          e.id as id_estudiante,
          CONCAT(e.nombre, ' ', e.apellidos) as nombre_estudiante,
          e.codigo,
          n.valor,
          n.comentario,
          n.id as id_nota
        FROM estudiante e
        INNER JOIN estudiante_aula ea ON e.id = ea.id_estudiante
        LEFT JOIN nota n ON n.id_estudiante = e.id AND n.id_comp = $2
        WHERE ea.id_aula = $1 AND ea.fecha_desasignado IS NULL
        ORDER BY e.apellidos, e.nombre
      `;
            const result = await this.pool.query(query, [id_aula, id_componente]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener notas del aula: ${error.message}`
            );
        }
    }

    async obtenerEstudiantesBajoRendimiento(id_aula: number, id_periodo: number): Promise<any[]> {
        try {
            const query = 'SELECT * FROM fn_estudiantes_bajo_rendimiento($1, $2)';
            const result = await this.pool.query(query, [id_aula, id_periodo]);
            return result.rows;
        } catch (error) {
            throw new InternalServerErrorException(
                `Error al obtener reporte de bajo rendimiento: ${error.message}`
            );
        }
    }
}
