import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { FiltroFechasDto } from './dto';
import {
    BoletinEstudianteReporte,
    EstudianteBajoRendimientoReporte,
    PlanillaNotasReporte,
    AsistenciaAulaReporte,
    AsistenciaEstudianteReporte,
    HorarioTutorReporte,
    NotasTutorReporte,
    EstadisticasAsistenciaAulaReporte,
    EstadisticasAsistenciaEstudiantesReporte,
} from './entities';


@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) { }

    // ===== REPORTES DE NOTAS =====

    @Get('boletin/estudiante/:id_estudiante/periodo/:id_periodo')
    @ApiOperation({
        summary: 'Obtener boletín de notas de un estudiante',
        description: 'Genera el boletín completo con todas las notas del estudiante en un periodo específico, incluyendo información del aula, institución y nota final ponderada.'
    })
    @ApiParam({ name: 'id_estudiante', description: 'ID del estudiante' })
    @ApiParam({ name: 'id_periodo', description: 'ID del periodo académico' })
    @ApiResponse({ status: 200, description: 'Boletín obtenido exitosamente', type: [BoletinEstudianteReporte] })
    @ApiResponse({ status: 404, description: 'Estudiante no encontrado o sin aula asignada' })
    @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
    obtenerBoletin(
        @Param('id_estudiante', ParseIntPipe) id_estudiante: number,
        @Param('id_periodo', ParseIntPipe) id_periodo: number
    ) {
        return this.reportesService.obtenerBoletin(id_estudiante, id_periodo);
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
        description: 'Permite al tutor ver todas las notas que ha ingresado en sus aulas asignadas. Reporte de autogestión según enunciado.'
    })
    @ApiParam({ name: 'id_tutor', description: 'ID del tutor' })
    @ApiResponse({ status: 200, description: 'Reporte de notas del tutor', type: [NotasTutorReporte] })
    obtenerNotasTutor(
        @Param('id_tutor', ParseIntPipe) id_tutor: number
    ) {
        return this.reportesService.obtenerNotasTutor(id_tutor);
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
