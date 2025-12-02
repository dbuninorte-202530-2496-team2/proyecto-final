import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginCard } from '../components/login';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/fondologin.png')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/30" />

      <div className="relative z-10">
        <LoginCard onLogin={login} />
      </div>

      <div className="absolute top-8 right-8 w-20 h-20 border-2 border-green-200 rounded-full opacity-20 pointer-events-none hidden lg:block animate-fadeInUp" style={{ animationDelay: "0.5s" }}></div>
      <div className="absolute bottom-8 left-8 w-32 h-32 border border-green-100 rounded-full opacity-10 pointer-events-none hidden lg:block animate-fadeInUp" style={{ animationDelay: "0.7s" }}></div>
    </div>
  );
}