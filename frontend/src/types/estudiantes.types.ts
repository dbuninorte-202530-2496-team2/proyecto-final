export type NotaPorComponente = Record<number, number | undefined>;

export interface Estudiante {
  id: number;
  nombre: string;
  notas: NotaPorComponente;
}
