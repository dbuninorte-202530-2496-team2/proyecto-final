export type UserRole = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';

export interface User {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: UserRole;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  usuario: User | null;
  rol: UserRole | null;
  login: (usuario: User) => void;
  logout: () => void;
}
