import { LogOut, User, Shield, UserCog, Zap } from 'lucide-react';
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
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'bg-red-600 text-white';
      case 'ADMINISTRATIVO':
        return 'bg-blue-600 text-white';
      case 'TUTOR':
        return 'bg-green-600 text-white';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 duration-300">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-green-900 animate-fadeInUp">
              GlobalEnglish
            </h1>
            <p className="mt-2 text-sm text-gray-600 font-medium">Sistema de Gestión del Programa de Bilingüismo</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 ml-1">Plataforma integrada • Gestión centralizada • Acceso en tiempo real</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 h-12 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg hover:from-green-100 hover:to-blue-100 transition-all shadow-sm">
          {getRoleIcon()}
          <div className="flex flex-col justify-center leading-tight">
            <div className="font-semibold text-gray-900 text-sm">{usuario}</div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getRoleBadgeColor()}`}>
              {rol === 'ADMINISTRADOR' ? '👨‍💼' : rol === 'ADMINISTRATIVO' ? '📋' : '👨‍🏫'} {rol}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="p-3 h-12 w-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all transform hover:scale-105 duration-200 text-gray-600 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}