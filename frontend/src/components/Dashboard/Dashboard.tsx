import { useAuth } from '../../context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { DashboardHeader } from './DashboardHeader';
import { AsignacionesTab } from './tabs/AsignacionesTab';
import { ClasesTab } from './tabs/ClasesTab';
import { NotasTab } from './tabs/NotasTab';
import { ReportesTab } from './tabs/ReportesTab';
import { InstitucionesTab } from './tabs/InstitucionesTab';
import { SedesTab } from './tabs/SedesTab';
import { ConfiguracionTab } from './tabs/ConfiguracionTab';

export default function Dashboard() {
  const { usuario, rol } = useAuth();

  if (!usuario || !rol) {
    return null;
  }

  const tienePermisoAdministrativo = rol === 'ADMINISTRADOR' || rol === 'ADMINISTRATIVO';
  const esTutor = rol === 'TUTOR';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <DashboardHeader />

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