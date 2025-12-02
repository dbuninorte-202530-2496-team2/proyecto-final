import { ApiProperty } from '@nestjs/swagger';

// Entidad para el boletín completo de un estudiante
export class BoletinEstudianteReporte {
    @ApiProperty({ description: 'Nombre del estudiante' })
    estudiante_nombre: string;

    @ApiProperty({ description: 'Apellidos del estudiante' })
    estudiante_apellidos: string;

    @ApiProperty({ description: 'Nombre de la institución' })
    institucion_nombre: string;

    @ApiProperty({ description: 'Nombre de la sede' })
    sede_nombre: string;

    @ApiProperty({ description: 'Grado del aula' })
    grado: number;

    @ApiProperty({ description: 'Grupo del aula' })
    grupo: number;

    @ApiProperty({ description: 'Programa (INSIDECLASSROOM o OUTSIDECLASSROOM)' })
    programa: string;

    @ApiProperty({ description: 'Año del periodo' })
    periodo_anho: number;

    @ApiProperty({ description: 'Nombre del componente' })
    componente_nombre: string;

    @ApiProperty({ description: 'Porcentaje del componente' })
    componente_porcentaje: number;

    @ApiProperty({ description: 'Valor de la nota' })
    nota_valor: number;

    @ApiProperty({ description: 'Nota ponderada según porcentaje' })
    nota_ponderada: number;

    @ApiProperty({ description: 'Nota final acumulada' })
    nota_final: number;
}

// Entidad para estudiantes con bajo rendimiento
export class EstudianteBajoRendimientoReporte {
    @ApiProperty({ description: 'ID del estudiante' })
    id_estudiante: number;

    @ApiProperty({ description: 'Nombre completo del estudiante' })
    nombre_completo: string;

    @ApiProperty({ description: 'Nota final del estudiante' })
    nota_final: number;

    @ApiProperty({ description: 'Cantidad de componentes reprobados' })
    componentes_reprobados: number;
}

// Entidad para planilla de notas por aula y componente
export class PlanillaNotasReporte {
    @ApiProperty({ description: 'ID del estudiante' })
    id_estudiante: number;

    @ApiProperty({ description: 'Nombre completo del estudiante' })
    nombre_estudiante: string;

    @ApiProperty({ description: 'Código del estudiante' })
    codigo: string;

    @ApiProperty({ description: 'Valor de la nota', nullable: true })
    valor: number | null;

    @ApiProperty({ description: 'Comentario de la nota', nullable: true })
    comentario: string | null;

    @ApiProperty({ description: 'ID de la nota', nullable: true })
    id_nota: number | null;
}

// Entidad para reporte de asistencia de aula
export class AsistenciaAulaReporte {
    @ApiProperty({ description: 'Número de semana' })
    semana_numero: number;

    @ApiProperty({ description: 'Fecha de inicio de la semana' })
    fecha_inicio_semana: string;

    @ApiProperty({ description: 'Fecha de fin de la semana' })
    fecha_fin_semana: string;

    @ApiProperty({ description: 'Nombre del tutor' })
    tutor_nombre: string;

    @ApiProperty({ description: 'ID del tutor' })
    tutor_id: number;

    @ApiProperty({ description: 'Fecha real de la clase' })
    fecha_real: string;

    @ApiProperty({ description: 'Si la fecha es festivo' })
    es_festivo: boolean;

    @ApiProperty({ description: 'Día de la semana' })
    dia_semana: string;

    @ApiProperty({ description: 'Hora de inicio' })
    hora_inicio: string;

    @ApiProperty({ description: 'Hora de fin' })
    hora_fin: string;

    @ApiProperty({ description: 'Si la clase fue dictada' })
    clase_dictada: boolean;

    @ApiProperty({ description: 'Horas dictadas' })
    horas_dictadas: number;

    @ApiProperty({ description: 'Horas no dictadas' })
    horas_no_dictadas: number;

    @ApiProperty({ description: 'Motivo de inasistencia', nullable: true })
    motivo_inasistencia: string | null;

    @ApiProperty({ description: 'Si hubo reposición' })
    hubo_reposicion: boolean;

    @ApiProperty({ description: 'Fecha de reposición', nullable: true })
    fecha_reposicion: string | null;
}

// Entidad para reporte de asistencia de estudiante
export class AsistenciaEstudianteReporte {
    @ApiProperty({ description: 'Nombre del estudiante' })
    estudiante_nombre: string;

    @ApiProperty({ description: 'Grado del aula' })
    aula_grado: number;

    @ApiProperty({ description: 'Grupo del aula' })
    aula_grupo: number;

    @ApiProperty({ description: 'Número de semana' })
    semana_numero: number;

    @ApiProperty({ description: 'Fecha real' })
    fecha_real: string;

    @ApiProperty({ description: 'Si la fecha es festivo' })
    es_festivo: boolean;

    @ApiProperty({ description: 'Día de la semana' })
    dia_semana: string;

    @ApiProperty({ description: 'Hora de inicio' })
    hora_inicio: string;

    @ApiProperty({ description: 'Hora de fin' })
    hora_fin: string;

    @ApiProperty({ description: 'Si el estudiante estuvo presente' })
    presente: boolean;

    @ApiProperty({ description: 'Nombre del tutor' })
    tutor_nombre: string;
}

// Entidad para horario de tutor
export class HorarioTutorReporte {
    @ApiProperty({ description: 'Grado del aula' })
    aula_grado: number;

    @ApiProperty({ description: 'Grupo del aula' })
    aula_grupo: number;

    @ApiProperty({ description: 'Nombre de la sede' })
    sede_nombre: string;

    @ApiProperty({ description: 'Día de la semana (LU, MA, MI, JU, VI, SA)' })
    dia_semana: string;

    @ApiProperty({ description: 'Hora de inicio' })
    hora_inicio: string;

    @ApiProperty({ description: 'Hora de fin' })
    hora_fin: string;
}

// Entidad para reporte de notas ingresadas por tutor
export class NotasTutorReporte {
    @ApiProperty({ description: 'Fecha de registro (placeholder)' })
    fecha_registro: string;

    @ApiProperty({ description: 'Nombre del estudiante' })
    estudiante_nombre: string;

    @ApiProperty({ description: 'Grado del aula' })
    aula_grado: number;

    @ApiProperty({ description: 'Grupo del aula' })
    aula_grupo: number;

    @ApiProperty({ description: 'Nombre de la sede' })
    sede_nombre: string;

    @ApiProperty({ description: 'Nombre de la institución' })
    institucion_nombre: string;

    @ApiProperty({ description: 'Nombre del componente' })
    componente_nombre: string;

    @ApiProperty({ description: 'Año del periodo' })
    periodo_anho: number;

    @ApiProperty({ description: 'Número del periodo' })
    periodo_numero: number;

    @ApiProperty({ description: 'Valor de la nota' })
    valor_nota: number;

    @ApiProperty({ description: 'Comentario', nullable: true })
    comentario: string | null;
}

// Entidad para reporte de asistencia del tutor
export class AsistenciaTutorReporte {
    @ApiProperty({ description: 'Fecha real de la clase' })
    fecha_real: string;

    @ApiProperty({ description: 'Día de la semana' })
    dia_semana: string;

    @ApiProperty({ description: 'Hora de inicio' })
    hora_inicio: string;

    @ApiProperty({ description: 'Hora de fin' })
    hora_fin: string;

    @ApiProperty({ description: 'Grado del aula' })
    aula_grado: number;

    @ApiProperty({ description: 'Grupo del aula' })
    aula_grupo: number;

    @ApiProperty({ description: 'Nombre de la sede' })
    sede_nombre: string;

    @ApiProperty({ description: 'Nombre de la institución' })
    institucion_nombre: string;

    @ApiProperty({ description: 'Si la clase fue dictada', nullable: true })
    dicto_clase: boolean | null;

    @ApiProperty({ description: 'Fecha de reposición', nullable: true })
    fecha_reposicion: string | null;

    @ApiProperty({ description: 'Descripción del motivo de inasistencia', nullable: true })
    motivo_descripcion: string | null;

    @ApiProperty({ description: 'Estado de la clase: DICTADA, NO_DICTADA, REPUESTA, PENDIENTE' })
    estado: string;
}


// Entidad para estadísticas de asistencia de aula
export class EstadisticasAsistenciaAulaReporte {
    @ApiProperty({ description: 'Total de clases programadas' })
    total_clases_programadas: number;

    @ApiProperty({ description: 'Total de clases dictadas' })
    total_clases_dictadas: number;

    @ApiProperty({ description: 'Total de clases no dictadas' })
    total_clases_no_dictadas: number;

    @ApiProperty({ description: 'Total de clases repuestas' })
    total_clases_repuestas: number;

    @ApiProperty({ description: 'Porcentaje de asistencia' })
    porcentaje_asistencia: number;

    @ApiProperty({ description: 'Horas totales programadas' })
    horas_totales_programadas: number;

    @ApiProperty({ description: 'Horas totales dictadas' })
    horas_totales_dictadas: number;
}

// Entidad para estadísticas de asistencia de estudiantes
export class EstadisticasAsistenciaEstudiantesReporte {
    @ApiProperty({ description: 'ID del estudiante' })
    id_estudiante: number;

    @ApiProperty({ description: 'Nombre del estudiante' })
    estudiante_nombre: string;

    @ApiProperty({ description: 'Total de clases' })
    total_clases: number;

    @ApiProperty({ description: 'Asistencias' })
    asistencias: number;

    @ApiProperty({ description: 'Inasistencias' })
    inasistencias: number;

    @ApiProperty({ description: 'Porcentaje de asistencia' })
    porcentaje_asistencia: number;
}
