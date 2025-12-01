export type UserRole = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';

export interface User {
  usuario: string;
  rol: UserRole;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  usuario: string | null;
  rol: UserRole | null;
  login: (usuario: string, rol: UserRole, token: string) => void;
  logout: () => void;
}