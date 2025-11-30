export interface Usuario {
    id: number;
    username: string;
    email: string;
    id_personal: number | null;
    personalNombre?: string;
    id_rol: number;
    rolNombre?: string;
    estado: 'ACTIVO' | 'INACTIVO';
    ultimo_acceso?: string;
}

export interface UsuarioFormData {
    username: string;
    email: string;
    id_personal: number | null;
    id_rol: number;
    estado: 'ACTIVO' | 'INACTIVO';
    password?: string; // Opcional, solo para creación o cambio
}
