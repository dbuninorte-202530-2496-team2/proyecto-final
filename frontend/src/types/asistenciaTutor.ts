export interface AsistenciaTutor {
    id: number;
    fecha: string; // YYYY-MM-DD
    id_horario: number;
    id_tutor: number;
    estado: 'DICTO_CLASE' | 'NO_DICTO_CLASE';
    motivo?: string; // Requerido si NO_DICTO_CLASE
    observaciones?: string;
    // Campos opcionales para display
    horarioInfo?: string;
    aulaInfo?: string;
    tutorNombre?: string;
}

export interface AsistenciaTutorFormData {
    fecha: string;
    id_horario: number;
    estado: 'DICTO_CLASE' | 'NO_DICTO_CLASE';
    motivo?: string;
    observaciones?: string;
}
