export interface Aula {
  id: number;
  grado: number;        // 4,5,9,10
  grupo: string;        // "A", "B", etc.
  id_sede: number;
  // campos solo para mostrar en la tabla
  sedeNombre?: string;
  institucionNombre?: string;
}
