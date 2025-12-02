export interface Aula {
  id: number;
  grado: 4 | 5 | 9 | 10;
  grupo: number;        // Changed from string to match backend
  id_sede: number;
  tipo_programa?: number; // Calculated by backend (1: INSIDE, 2: OUTSIDE)
  // campos solo para mostrar en la tabla
  sedeNombre?: string;
  institucionNombre?: string;
}

export interface AulaFormData {
  grado: 4 | 5 | 9 | 10;
  grupo: number;
  id_sede: number;
}

// DTOs for API operations
export interface CreateAulaDto {
  grado: 4 | 5 | 9 | 10;
  grupo: number;
  id_sede: number;
}

export interface UpdateAulaDto {
  grado?: 4 | 5 | 9 | 10;
  grupo?: number;
  id_sede?: number;
}
