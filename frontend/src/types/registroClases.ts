// Semana académica 
export interface Semana {
  id: number;
  fec_ini: string; // 'YYYY-MM-DD'
  fec_fin: string; // 'YYYY-MM-DD'
  id_periodo: number;
}

// Motivo: para justificar inasistencias o reposición
export interface Motivo {
  id: number;
  descripcion: string;
}

// Registro de asistencia de un estudiante en una clase puntual
export interface AsistenciaEstudiante {
  id: number;
  fecha_real: string;   // 'YYYY-MM-DD'
  asistio: boolean;
  id_estudiante: number;
  id_aula: number;
  id_tutor: number;     
  id_horario: number;
  id_semana: number;
  id_motivo?: number | null; // opcional para justificar
}
