import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [rol, setRol] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  // Cargar datos de sesión desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    const storedRole = localStorage.getItem('rol');
    const storedToken = localStorage.getItem('token');

    // Solo autenticar si tenemos usuario, rol Y token
    if (storedUser && storedRole && storedToken) {
      setUsuario(storedUser);
      setRol(storedRole as UserRole);
      setIsAuthenticated(true);
    } else {
      // Si falta alguno, limpiar todo
      localStorage.removeItem('usuario');
      localStorage.removeItem('rol');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, []);

  const login = (user: string, userRole: UserRole, token: string) => {
    setUsuario(user);
    setRol(userRole);
    setIsAuthenticated(true);

    // Guardar en localStorage para persistencia
    localStorage.setItem('usuario', user);
    localStorage.setItem('rol', userRole);
    localStorage.setItem('token', token); // Guardar el token JWT

    // Navegar al dashboard
    navigate('/dashboard');
  };

  const logout = () => {
    setUsuario(null);
    setRol(null);
    setIsAuthenticated(false);

    // Limpiar localStorage
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('token'); // Limpiar el token

    // Navegar al login
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, usuario, rol, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}