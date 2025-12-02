export interface ReporteAulaResumen {
  id_aula: number;
  nombre_aula: string;
  institucion: string;
  sede: string;
  total_estudiantes: number;
  porcentaje_asistencia: number; // 0-100
  promedio_inside: number | null;
  promedio_outside: number | null;
}

export interface ReporteEstudianteAula {
  id_estudiante: number;
  nombre_completo: string;
  documento: string;
  porcentaje_asistencia: number; // 0-100
  promedio_inside: number | null;
  promedio_outside: number | null;
}

// ============================================
// REPORTES AVANZADOS
// ============================================

/**
 * Reporte detallado de asistencia por aula
 * Muestra el historial completo de clases con toda la información requerida
 */
export interface AsistenciaAulaDetalle {
  semana_numero: number;
  fecha_inicio_semana: string;       // YYYY-MM-DD
  fecha_fin_semana: string;          // YYYY-MM-DD
  tutor_nombre: string;
  tutor_id: number;
  fecha_real: string;                // YYYY-MM-DD
  es_festivo: boolean;
  dia_semana: string;                // "Lunes", "Martes", etc.
  hora_inicio: string;               // HH:mm:ss
  hora_fin: string;                  // HH:mm:ss
  clase_dictada: boolean;
  horas_dictadas: number;
  horas_no_dictadas: number;
  motivo_inasistencia: string | null;
  hubo_reposicion: boolean;
  fecha_reposicion: string | null;   // YYYY-MM-DD
}

/**
 * Estadísticas resumen para el reporte de asistencia por aula
 */
export interface AsistenciaAulaEstadisticas {
  total_programadas: number;
  total_dictadas: number;
  total_no_dictadas: number;
  total_con_reposicion: number;
  porcentaje_cumplimiento: number;   // 0-100
}

/**
 * Reporte detallado de asistencia por estudiante individual
 * Muestra el historial completo de asistencia de un estudiante
 */
export interface AsistenciaEstudianteDetalle {
  estudiante_nombre: string;
  aula_grado: number;
  aula_grupo: number; // 1=A, 2=B, etc. or just number if that's how it is
  semana_numero: number;
  fecha_real: string;                // YYYY-MM-DD
  es_festivo: boolean;
  dia_semana: string;
  hora_inicio: string;               // HH:mm:ss
  hora_fin: string;                  // HH:mm:ss
  presente: boolean;
  tutor_nombre: string;
}

/**
 * Estadísticas de asistencia para un estudiante
 */
export interface AsistenciaEstudianteEstadisticas {
  id_estudiante: number;
  nombre_completo: string;
  documento: string;
  total_programadas: number;
  total_asistidas: number;
  total_faltadas: number;
  porcentaje_asistencia: number;     // 0-100
}

/**
 * Componente de evaluación con nota para el boletín
 */
export interface ComponenteNota {
  id_componente: number;
  nombre_componente: string;         // "Listening", "Speaking", etc.
  porcentaje: number;                // 25, 30, etc.
  nota: number | null;               // 0-100, null si no tiene nota
  nota_ponderada: number;            // (nota * porcentaje / 100)
}

/**
 * Boletín de calificaciones completo de un estudiante
 * Retorna UNA SOLA fila con todos los componentes en un array
 */
export interface BoletinEstudiante {
  estudiante_id: number;
  estudiante_codigo: string;
  estudiante_nombre: string;
  estudiante_apellidos: string;
  tipo_documento: string;
  documento: string;
  institucion_nombre: string;
  sede_nombre: string;
  grado: number;
  grupo: number;
  programa: string; // 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM'
  tipo_programa: number; // 1 = INSIDE, 2 = OUTSIDE
  periodo_id: number;
  periodo_nombre: string;
  periodo_anho: number;
  periodo_numero: number;
  componentes: ComponenteNota[];
  nota_definitiva: number;
}

/**
 * Filtros para el reporte de asistencia por aula
 */
export interface FiltrosAsistenciaAula {
  id_institucion: number | null;
  id_sede: number | null;
  id_aula: number | null;
  fecha_desde: string;               // YYYY-MM-DD
  fecha_hasta: string;               // YYYY-MM-DD
}

/**
 * Filtros para el reporte de asistencia por estudiante
 */
export interface FiltrosAsistenciaEstudiante {
  id_institucion: number | null;
  id_sede: number | null;
  id_aula: number | null;
  id_estudiante: number | null;
  fecha_desde: string;               // YYYY-MM-DD
  fecha_hasta: string;               // YYYY-MM-DD
}

/**
 * Filtros para el boletín de calificaciones
 * Solo requiere ID de estudiante - retorna todas las filas (una por periodo)
 */
export interface FiltrosBoletinCalificaciones {
  id_estudiante: number | null;
}

