import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Headers,
    Res,
    Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { PdfService } from './pdf.service';
import { FiltroFechasDto } from './dto';
import {
    BoletinEstudianteReporte,
    EstudianteBajoRendimientoReporte,
    PlanillaNotasReporte,
    AsistenciaAulaReporte,
    AsistenciaEstudianteReporte,
    HorarioTutorReporte,
    NotasTutorReporte,
    AsistenciaTutorReporte,
    EstadisticasAsistenciaAulaReporte,
    EstadisticasAsistenciaEstudiantesReporte,
} from './entities';
import { PG_CONNECTION } from '../database/database.module';
import { Pool } from 'pg';



@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
    constructor(
        private readonly reportesService: ReportesService,
        private readonly pdfService: PdfService,
        @Inject(PG_CONNECTION) private readonly pool: Pool,
    ) { }

    // ===== REPORTES DE NOTAS =====

    @Get('boletin')
    @ApiOperation({
        summary: 'Obtener boletín de notas de un estudiante',
        description: 'Genera el boletín completo de un estudiante con todas las notas de todos los periodos. Retorna una fila por cada periodo con sus componentes y nota definitiva.'
    })
    @ApiResponse({ status: 200, description: 'Boletín obtenido exitosamente (array de periodos)', type: [BoletinEstudianteReporte] })
    @ApiResponse({ status: 404, description: 'Estudiante no encontrado o sin aula asignada' })
    @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
    async getBoletin(
        @Query('id_estudiante', ParseIntPipe) id_estudiante: number,
    ) {
        return this.reportesService.obtenerBoletin(id_estudiante);
    }

    @Get('planilla/aula/:id_aula/componente/:id_componente')
    @ApiOperation({
        summary: 'Obtener planilla de notas de un aula por componente',
        description: 'Lista todos los estudiantes de un aula con sus notas en un componente específico. Útil para el tutor al momento de ingresar notas.'
    })
    @ApiParam({ name: 'id_aula', description: 'ID del aula' })
    @ApiParam({ name: 'id_componente', description: 'ID del componente de evaluación' })
    @ApiResponse({ status: 200, description: 'Planilla obtenida exitosamente', type: [PlanillaNotasReporte] })
    obtenerNotasAulaComponente(
        @Param('id_aula', ParseIntPipe) id_aula: number,
        @Param('id_componente', ParseIntPipe) id_componente: number
    ) {
        return this.reportesService.obtenerNotasAulaComponente(id_aula, id_componente);
    }

    @Get('bajo-rendimiento/aula/:id_aula/periodo/:id_periodo')
    @ApiOperation({
        summary: 'Obtener reporte de estudiantes con bajo rendimiento',
        description: 'Identifica estudiantes con nota final menor a 3.0, mostrando cantidad de componentes reprobados. Reporte clave para intervención temprana.'
    })
    @ApiParam({ name: 'id_aula', description: 'ID del aula' })
    @ApiParam({ name: 'id_periodo', description: 'ID del periodo académico' })
    @ApiResponse({ status: 200, description: 'Reporte generado exitosamente', type: [EstudianteBajoRendimientoReporte] })
    obtenerBajoRendimiento(
        @Param('id_aula', ParseIntPipe) id_aula: number,
        @Param('id_periodo', ParseIntPipe) id_periodo: number
    ) {
        return this.reportesService.obtenerEstudiantesBajoRendimiento(id_aula, id_periodo);
    }

    // ===== REPORTES DE ASISTENCIA =====

    @Get('asistencia/aula/:id_aula')
    @ApiOperation({
        summary: 'Obtener reporte de asistencia de un aula',
        description: 'Reporte detallado de asistencia del aula mostrando por semana, tutor, horario, si la clase se dictó, motivo de inasistencia y reposiciones. Indicador clave del enunciado.'
    })
    @ApiParam({ name: 'id_aula', description: 'ID del aula' })
    @ApiResponse({ status: 200, description: 'Reporte de asistencia generado', type: [AsistenciaAulaReporte] })
    obtenerAsistenciaAula(
        @Param('id_aula', ParseIntPipe) id_aula: number,
        @Query() filtro: FiltroFechasDto
    ) {
        return this.reportesService.obtenerAsistenciaAula(
            id_aula,
            filtro.fecha_inicio,
            filtro.fecha_fin
        );
    }

    @Get('asistencia/estudiante/:id_estudiante')
    @ApiOperation({
        summary: 'Obtener reporte de asistencia de un estudiante',
        description: 'Reporte detallado de asistencia individual del estudiante. Factor clave en el éxito del programa según el enunciado.'
    })
    @ApiParam({ name: 'id_estudiante', description: 'ID del estudiante' })
    @ApiResponse({ status: 200, description: 'Reporte de asistencia generado', type: [AsistenciaEstudianteReporte] })
    obtenerAsistenciaEstudiante(
        @Param('id_estudiante', ParseIntPipe) id_estudiante: number,
        @Query() filtro: FiltroFechasDto
    ) {
        return this.reportesService.obtenerAsistenciaEstudiante(
            id_estudiante,
            filtro.fecha_inicio,
            filtro.fecha_fin
        );
    }

    @Get('estadisticas-asistencia/aula/:id_aula/periodo/:id_periodo')
    @ApiOperation({
        summary: 'Obtener estadísticas de asistencia de un aula',
        description: 'Estadísticas agregadas: total de clases programadas, dictadas, no dictadas, repuestas y porcentajes. Indicador de gestión del programa.'
    })
    @ApiParam({ name: 'id_aula', description: 'ID del aula' })
    @ApiParam({ name: 'id_periodo', description: 'ID del periodo académico' })
    @ApiResponse({ status: 200, description: 'Estadísticas generadas', type: EstadisticasAsistenciaAulaReporte })
    obtenerEstadisticasAsistenciaAula(
        @Param('id_aula', ParseIntPipe) id_aula: number,
        @Param('id_periodo', ParseIntPipe) id_periodo: number
    ) {
        return this.reportesService.obtenerEstadisticasAsistenciaAula(id_aula, id_periodo);
    }

    @Get('estadisticas-asistencia/estudiantes/aula/:id_aula/periodo/:id_periodo')
    @ApiOperation({
        summary: 'Obtener estadísticas de asistencia de estudiantes por aula',
        description: 'Estadísticas individuales de cada estudiante del aula: total de clases, asistencias, inasistencias y porcentaje.'
    })
    @ApiParam({ name: 'id_aula', description: 'ID del aula' })
    @ApiParam({ name: 'id_periodo', description: 'ID del periodo académico' })
    @ApiResponse({ status: 200, description: 'Estadísticas generadas', type: [EstadisticasAsistenciaEstudiantesReporte] })
    obtenerEstadisticasAsistenciaEstudiantes(
        @Param('id_aula', ParseIntPipe) id_aula: number,
        @Param('id_periodo', ParseIntPipe) id_periodo: number
    ) {
        return this.reportesService.obtenerEstadisticasAsistenciaEstudiantesAula(id_aula, id_periodo);
    }

    // ===== REPORTES DE AUTOGESTIÓN PARA TUTORES =====

    @Get('tutor/:id_tutor/notas')
    @ApiOperation({
        summary: 'Obtener reporte de notas ingresadas por un tutor (Autogestión)',
        description: 'Permite al tutor ver todas las notas que ha ingresado en sus aulas asignadas, con información de sede, institución y periodo. Reporte de autogestión según enunciado.'
    })
    @ApiParam({ name: 'id_tutor', description: 'ID del tutor' })
    @ApiResponse({ status: 200, description: 'Reporte de notas del tutor', type: [NotasTutorReporte] })
    async obtenerNotasTutor(
        @Param('id_tutor', ParseIntPipe) id_tutor: number,
        @Headers('accept') accept: string,
        @Res() res: Response,
    ) {
        const data = await this.reportesService.obtenerNotasTutor(id_tutor);

        // Check if PDF is requested
        if (accept && accept.includes('application/pdf')) {
            // Get tutor name
            const tutorResult = await this.pool.query(
                'SELECT nombre, apellido FROM personal WHERE id = $1',
                [id_tutor]
            );
            const tutorNombre = tutorResult.rows.length > 0
                ? `${tutorResult.rows[0].nombre} ${tutorResult.rows[0].apellido}`
                : `Tutor ${id_tutor}`;

            const pdfBuffer = await this.pdfService.generateNotasTutorPDF(data, tutorNombre);

            const fecha = new Date().toISOString().split('T')[0];
            const filename = `reporte-notas-tutor-${id_tutor}-${fecha}.pdf`;

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } else {
            // Return JSON
            res.json(data);
        }
    }

    @Get('tutor/:id_tutor/asistencia')
    @ApiOperation({
        summary: 'Obtener historial de asistencia del tutor (Autogestión)',
        description: 'Muestra el historial completo de clases del tutor: clases dictadas, no dictadas, reposiciones programadas y motivos de inasistencia. Permite filtrar por rango de fechas.'
    })
    @ApiParam({ name: 'id_tutor', description: 'ID del tutor' })
    @ApiResponse({ status: 200, description: 'Historial de asistencia del tutor', type: [AsistenciaTutorReporte] })
    async obtenerAsistenciaTutor(
        @Param('id_tutor', ParseIntPipe) id_tutor: number,
        @Query() filtro: FiltroFechasDto,
        @Headers('accept') accept: string,
        @Res() res: Response,
    ) {
        const data = await this.reportesService.obtenerAsistenciaTutor(
            id_tutor,
            filtro.fecha_inicio,
            filtro.fecha_fin
        );

        // Check if PDF is requested
        if (accept && accept.includes('application/pdf')) {
            // Get tutor name
            const tutorResult = await this.pool.query(
                'SELECT nombre, apellido FROM personal WHERE id = $1',
                [id_tutor]
            );
            const tutorNombre = tutorResult.rows.length > 0
                ? `${tutorResult.rows[0].nombre} ${tutorResult.rows[0].apellido}`
                : `Tutor ${id_tutor}`;

            const pdfBuffer = await this.pdfService.generateAsistenciaTutorPDF(
                data,
                tutorNombre,
                filtro
            );

            const fecha = new Date().toISOString().split('T')[0];
            const filename = `reporte-asistencia-tutor-${id_tutor}-${fecha}.pdf`;

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } else {
            // Return JSON
            res.json(data);
        }
    }


    @Get('tutor/:id_tutor/horario/periodo/:id_periodo')
    @ApiOperation({
        summary: 'Obtener horario asignado a un tutor (Autogestión)',
        description: 'Muestra el horario de clases del tutor en un periodo. Reporte de autogestión según enunciado.'
    })
    @ApiParam({ name: 'id_tutor', description: 'ID del tutor' })
    @ApiParam({ name: 'id_periodo', description: 'ID del periodo académico' })
    @ApiResponse({ status: 200, description: 'Horario del tutor', type: [HorarioTutorReporte] })
    obtenerHorarioTutor(
        @Param('id_tutor', ParseIntPipe) id_tutor: number,
        @Param('id_periodo', ParseIntPipe) id_periodo: number
    ) {
        return this.reportesService.obtenerHorarioTutor(id_tutor, id_periodo);
    }
}
