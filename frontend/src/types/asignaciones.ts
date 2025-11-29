export interface TutorAula {
  id: number;
  id_aula: number;
  id_tutor: number;
  fecha_asignado: string; // 'YYYY-MM-DD'
  fecha_desasignado?: string | null; // null si sigue activo
}

export interface AulaHorario {
  id: number;
  id_aula: number;
  id_horario: number;
}
