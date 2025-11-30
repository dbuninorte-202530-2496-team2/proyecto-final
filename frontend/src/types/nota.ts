// Tabla COMPONENTE
export interface Componente {
  id: number;
  nombre: string;        
  tipo_programa: 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM';
  porcentaje: number;    // peso dentro del periodo (0-100)
  id_periodo: number;
}

// Tabla NOTA
export interface Nota {
  id: number;
  valor: number;         // 0-100
  comentario?: string | null;
  id_tutor: number;
  id_comp: number;
  id_estudiante: number;
}
