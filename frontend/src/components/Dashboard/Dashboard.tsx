import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { DashboardHeader } from './DashboardHeader';
import { InstitucionesTab } from './tabs/InstitucionesTab';
import { SedesTab } from './tabs/SedesTab';
import { AulasTab } from './tabs/AulasTab';
import { PersonalTab } from './tabs/PersonalTab';
import EstudiantesTab from './tabs/EstudiantesTab';
import HorariosTab from './tabs/HorariosTab';
import AsignacionesTab from './tabs/AsignacionesTab';
import RegistroClasesTab from './tabs/RegistroClasesTab';
import NotasTab from './tabs/NotasTab';
import ReportesTab from './tabs/ReportesTab';
import ConfiguracionTab from './tabs/ConfiguracionTab';
import { useAuth } from '../../context/AuthContext';
import { Building2, MapPin, Zap, Users, Clock, FileText, BookOpen, Settings, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { rol } = useAuth();
  const tienePermisoAdministrativo = rol === 'ADMINISTRADOR' || rol === 'ADMINISTRATIVO';
  const esTutor = rol === 'TUTOR';

  const tabs = [
    ...(tienePermisoAdministrativo ? [
      { value: 'instituciones', label: 'Instituciones', icon: Building2 },
      { value: 'sedes', label: 'Sedes', icon: MapPin },
      { value: 'aulas', label: 'Aulas', icon: Zap },
      { value: 'personal', label: 'Personal', icon: Users },
      { value: 'estudiantes', label: 'Estudiantes', icon: BookOpen },
      { value: 'horarios', label: 'Horarios', icon: Clock },
      { value: 'asignaciones', label: 'Asignaciones', icon: FileText },
    ] : []),
    { value: 'clases', label: esTutor ? 'Mis Clases' : 'Registro de Clases', icon: BookOpen },
    { value: 'notas', label: 'Notas', icon: FileText },
    ...(tienePermisoAdministrativo ? [
      { value: 'configuracion', label: 'Configuración', icon: Settings },
    ] : []),
    { value: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader />

        {/* Tabs mejorados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
          <Tabs defaultValue={esTutor ? "clases" : "instituciones"}>
            <TabsList className="flex flex-wrap h-auto gap-2 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl border border-gray-200">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger 
                  key={value} 
                  value={value}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Contenido de tabs */}
            <div className="mt-6">
              {tienePermisoAdministrativo && (
                <>
                  <TabsContent value="instituciones">
                    <InstitucionesTab />
                  </TabsContent>
                  <TabsContent value="sedes">
                    <SedesTab />
                  </TabsContent>
                  <TabsContent value="aulas">
                    <AulasTab />
                  </TabsContent>
                  <TabsContent value="personal">
                    <PersonalTab />
                  </TabsContent>
                  <TabsContent value="estudiantes">
                    <EstudiantesTab />
                  </TabsContent>
                  <TabsContent value="horarios">
                    <HorariosTab />
                  </TabsContent>
                  <TabsContent value="asignaciones">
                    <AsignacionesTab />
                  </TabsContent>
                </>
              )}

              <TabsContent value="clases">
                <RegistroClasesTab />
              </TabsContent>

              <TabsContent value="notas">
                <NotasTab />
              </TabsContent>

              <TabsContent value="reportes">
                <ReportesTab />
              </TabsContent>

              {tienePermisoAdministrativo && (
                <TabsContent value="configuracion">
                  <ConfiguracionTab />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}