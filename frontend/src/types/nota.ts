// Tabla COMPONENTE
export interface Componente {
  id: number;
  nombre: string;
  tipo_programa: number; // 1: INSIDECLASSROOM, 2: OUTSIDECLASSROOM
  porcentaje: number;    // peso dentro del periodo (0-100)
  id_periodo: number;
}

// Tabla NOTA (Read Model - Matches NotaEntity)
export interface Nota {
  id: number;
  valor: number;         // 0-100
  comentario?: string | null;
  id_tutor: number;
  id_comp: number;       // Matches database column / Entity
  id_estudiante: number;
}

// DTO para registrar nota (Write Model - Matches RegistrarNotaDto)
export interface RegistrarNotaPayload {
  id_estudiante: number;
  id_componente: number; // Matches DTO property
  id_tutor: number;
  valor: number;         // 0-100
  comentario?: string;
}
