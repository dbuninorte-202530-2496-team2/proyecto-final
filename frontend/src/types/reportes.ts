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
  semana: number;                    // Número de semana del programa
  fecha_real: string;                // Fecha de la clase (YYYY-MM-DD)
  id_tutor: number;
  nombre_tutor: string;
  dia_semana: string;                // "Lunes", "Martes", etc.
  horario: string;                   // "LU 07:00-07:45"
  es_festivo: boolean;
  hubo_clase: boolean;
  horas_dictadas: number;            // Número de horas (equivalente)
  horas_no_dictadas: number;         // Número de horas (equivalente)
  motivo_no_clase: string | null;    // Motivo si no hubo clase
  hubo_reposicion: boolean;
  fecha_reposicion: string | null;   // Fecha en que se repuso (YYYY-MM-DD)
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
  fecha: string;                     // Fecha de la clase (YYYY-MM-DD)
  id_aula: number;
  aula: string;                      // "4°A", "9°B", etc.
  id_tutor: number;
  nombre_tutor: string;
  horario: string;                   // "LU 07:00-07:45"
  asistio: boolean;
  id_motivo: number | null;
  motivo: string | null;             // Motivo de ausencia si aplica
  observaciones: string | null;
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
 */
export interface BoletinEstudiante {
  id_estudiante: number;
  nombre_estudiante: string;
  documento: string;
  tipo_documento: string;            // "TI", "CC", etc.
  institucion: string;
  sede: string;
  grado: number;                     // 4, 5, 9, 10
  grupo: string;                     // "A", "B", etc.
  programa: 'INSIDE' | 'OUTSIDE';
  periodo: string;                   // Nombre del periodo
  componentes: ComponenteNota[];
  nota_definitiva: number;           // Suma de notas ponderadas
  estado_aprobacion: 'APROBADO' | 'APROBADO_CON_DIFICULTADES' | 'NO_APROBADO';
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
 */
export interface FiltrosBoletinCalificaciones {
  id_institucion: number | null;
  id_sede: number | null;
  id_aula: number | null;
  id_estudiante: number | null;
  id_periodo: number | null;
}

