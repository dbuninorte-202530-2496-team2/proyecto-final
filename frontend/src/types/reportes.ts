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
