import { useAuth } from '../../context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { DashboardHeader } from './DashboardHeader';
<<<<<<< Updated upstream
import { AsignacionesTab } from './tabs/AsignacionesTab';
import { ClasesTab } from './tabs/ClasesTab';
import { NotasTab } from './tabs/NotasTab';
import { ReportesTab } from './tabs/ReportesTab';
import { InstitucionesTab } from './tabs/InstitucionesTab';
import { SedesTab } from './tabs/SedesTab';
import { ConfiguracionTab } from './tabs/ConfiguracionTab';
=======
import NotasTab from './tabs/NotasTab';
import ReportesTab from './tabs/ReportesTab';
import { InstitucionesTab } from './tabs/InstitucionesTab';
import { SedesTab } from './tabs/SedesTab';
import { AulasTab } from './tabs/AulasTab';
import { PersonalTab } from './tabs/PersonalTab';
import EstudiantesTab from './tabs/EstudiantesTab';
import HorariosTab from './tabs/HorariosTab';
import RegistroClasesTab from './tabs/RegistroClasesTab';
import ConfiguracionTab from './tabs/ConfiguracionTab';
import { Building2, MapPin, Zap, Users, Clock, FileText, BookOpen, Settings, BarChart3 } from 'lucide-react';
import AsignacionesTab from './tabs/AsignacionesTab';
import HorariosTutorTab from './tabs/HorariosTutorTab';
>>>>>>> Stashed changes

export default function Dashboard() {
  const { usuario, rol } = useAuth();

  if (!usuario || !rol) {
    return null;
  }

  const tienePermisoAdministrativo = rol === 'ADMINISTRADOR' || rol === 'ADMINISTRATIVO';
  const esTutor = rol === 'TUTOR';

<<<<<<< Updated upstream
=======
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
    ...(esTutor ? [
      { value: 'mi-horario', label: 'Mi Horario', icon: Clock },
    ] : []),
    { value: 'notas', label: 'Notas', icon: FileText },
    ...(tienePermisoAdministrativo ? [
      { value: 'configuracion', label: 'Configuración', icon: Settings },
    ] : []),
    { value: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

>>>>>>> Stashed changes
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <DashboardHeader />

<<<<<<< Updated upstream
        <Tabs defaultValue={esTutor ? "asignaciones" : "instituciones"}>
          <TabsList className="flex flex-wrap h-auto gap-2">
            {/* Tabs solo para TUTOR */}
            {esTutor && (
              <>
                <TabsTrigger value="asignaciones">Mis Aulas</TabsTrigger>
                <TabsTrigger value="clases">Asistencia</TabsTrigger>
                <TabsTrigger value="notas">Notas</TabsTrigger>
                <TabsTrigger value="reportes">Reportes</TabsTrigger>
              </>
            )}
=======
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
>>>>>>> Stashed changes

            {/* Tabs para Administrador y Administrativo */}
            {tienePermisoAdministrativo && (
              <>
                <TabsTrigger value="instituciones">Instituciones</TabsTrigger>
                <TabsTrigger value="sedes">Sedes</TabsTrigger>
                <TabsTrigger value="aulas">Aulas</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
                <TabsTrigger value="horarios">Horarios</TabsTrigger>
                <TabsTrigger value="asignaciones-admin">Asignaciones</TabsTrigger>
                <TabsTrigger value="clases">Clases</TabsTrigger>
                <TabsTrigger value="notas">Notas</TabsTrigger>
                <TabsTrigger value="configuracion">Configuración</TabsTrigger>
                <TabsTrigger value="reportes">Reportes</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Contenido para TUTOR */}
          {esTutor && (
            <>
              <TabsContent value="asignaciones">
                <AsignacionesTab />
              </TabsContent>

              <TabsContent value="clases">
                <ClasesTab />
              </TabsContent>

              <TabsContent value="notas">
                <NotasTab />
              </TabsContent>

<<<<<<< Updated upstream
              <TabsContent value="reportes">
                <ReportesTab />
              </TabsContent>
            </>
          )}

          {/* Contenido para ADMINISTRADOR y ADMINISTRATIVO */}
          {tienePermisoAdministrativo && (
            <>
              <TabsContent value="instituciones">
                <InstitucionesTab />
              </TabsContent>

              <TabsContent value="sedes">
                <SedesTab />
              </TabsContent>

              <TabsContent value="clases">
                <ClasesTab />
              </TabsContent>

              <TabsContent value="notas">
                <NotasTab />
              </TabsContent>
=======
              {esTutor &&
                <TabsContent value="mi-horario">
                  <HorariosTutorTab />
                </TabsContent>
              }
>>>>>>> Stashed changes

              <TabsContent value="configuracion">
                <ConfiguracionTab />
              </TabsContent>

              <TabsContent value="reportes">
                <ReportesTab />
              </TabsContent>

              {/* Agregar más tabs aquí según necesites */}
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}