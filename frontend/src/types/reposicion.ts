export interface ReposicionClase {
  id: number;
  id_tutor: number;
  id_aula: number;
  id_horario: number;
  fecha_original: string;  
  fecha_reposicion: string;  
  id_motivo: number | null;
}
