export interface Rol {
  id: number;
  nombre: 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR' | string;
  descripcion?: string;
}