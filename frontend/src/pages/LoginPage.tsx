import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginCard } from '../components/login';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/fondologin.png')" }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
      <div className="relative z-10">
        <LoginCard onLogin={login} />
      </div>
    </div>
  );
}