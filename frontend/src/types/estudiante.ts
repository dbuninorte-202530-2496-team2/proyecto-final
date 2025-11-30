export interface Estudiante {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_doc: number;     // FK a TipoDocumento
  num_doc: string;
  id_aula: number;      // FK a Aula
  score_in?: number | null;   
  score_out?: number | null;  
}
