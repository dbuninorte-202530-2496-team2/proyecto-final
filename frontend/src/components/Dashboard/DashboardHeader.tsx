import { LogOut, User, Shield, UserCog } from 'lucide-react';
import {useAuth} from '../../context/AuthContext';

interface DashboardHeaderProps {
  usuario: string;
  rol: 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';
  onLogout: () => void;
}

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
        return 'bg-primary-600 text-white';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary-700 text-green-950">
          GlobalEnglish
        </h1>
        <p className="text-gray-600">
          Sistema de Gestión del Programa de Bilingüismo
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
          {getRoleIcon()}
<<<<<<< Updated upstream
          <div className="text-sm">
            <div className="font-medium text-gray-900">{usuario}</div>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor()}`}>
              {rol}
=======
          <div className="flex flex-col justify-center leading-tight">
            <div className="font-semibold text-gray-900 text-sm">{usuario?.nombres} {usuario?.apellidos}</div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getRoleBadgeColor()}`}>
              {rol === 'ADMINISTRADOR' ? '👨‍💼' : rol === 'ADMINISTRATIVO' ? '📋' : '👨‍🏫'} {rol}
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}