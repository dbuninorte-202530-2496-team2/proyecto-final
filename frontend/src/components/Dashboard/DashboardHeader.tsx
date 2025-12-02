import { LogOut, Shield, UserCog, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function DashboardHeader() {
  const { usuario, rol, logout } = useAuth();

  const getRoleIcon = () => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <Shield className="w-5 h-5" />;
      case 'ADMINISTRATIVO':
        return <UserCog className="w-5 h-5" />;
      case 'TUTOR':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <UserCog className="w-5 h-5" />;
    }
  };

  const getRoleColorClass = () => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'ADMINISTRATIVO':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TUTOR':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAvatarColor = () => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'ADMINISTRATIVO':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'TUTOR':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-green-900 animate-fadeInUp">
              GlobalEnglish
            </h1>
            <p className="mt-2 text-sm text-gray-600 font-medium">Sistema de Gestión del Programa de Bilingüismo</p>
          </div>
        </div>

      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${getAvatarColor()}`}>
            {getRoleIcon()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 leading-tight tracking-tight">{usuario}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${rol === 'ADMINISTRADOR' ? 'text-red-600' : rol === 'ADMINISTRATIVO' ? 'text-blue-600' : 'text-emerald-600'}`}>
              {rol}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="group flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}