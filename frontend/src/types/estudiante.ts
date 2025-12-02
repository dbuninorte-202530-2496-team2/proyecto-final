export interface Estudiante {
  id: number;
  codigo: string;
  nombre: string;
  apellidos: string;
  tipo_doc: number;
  score_in?: number | null;
  score_out?: number | null;
  aula_actual_id?: number | null; // From JOIN with estudiante_aula
}
