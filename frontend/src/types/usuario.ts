// Backend usuario structure
export interface UsuarioBackend {
    usuario: string;
    contrasena: string;
}

// Display model - joins usuario + personal + rol data
export interface Usuario {
    usuario: string; // username (from usuario table)
    email: string; // from personal.correo
    id_personal: number; // from personal.id
    personalNombre?: string; // joined from personal (nombre + apellido)
    id_rol: number; // from personal.id_rol
    rolNombre?: string; // joined from rol.nombre
}

export interface UsuarioFormData {
    usuario: string;
    contrasena: string;
    id_personal: number;
}
