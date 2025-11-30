export interface Semana {
    id: number;
    numero: number;
    fecha_inicio: string; // YYYY-MM-DD
    fecha_fin: string;    // YYYY-MM-DD
    id_periodo: number;
    periodoNombre?: string;
}
