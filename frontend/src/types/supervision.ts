export interface ClaseProgramada {
  id: number;
  id_tutor: number;
  id_aula: number;
  id_horario: number;
  fecha_programada: string; // YYYY-MM-DD
}

export interface SupervisionResumenTutor {
  id_tutor: number;
  nombre_tutor: string;
  total_programadas: number;
  total_con_asistencia: number;
  cumplimiento: number; // 0 - 100
}

export interface SupervisionDetalleClase {
  id_programacion: number;
  fecha_programada: string;
  aula: string;
  horario: string;
  registro_asistencia: 'CON_REGISTRO' | 'SIN_REGISTRO';
  porcentaje_asistencia_estudiantes: number | null;
}
