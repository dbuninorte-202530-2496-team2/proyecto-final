import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { DashboardHeader } from './DashboardHeader';
import { InstitucionesTab } from './tabs/InstitucionesTab';
import { SedesTab } from './tabs/SedesTab';
import { ClasesTab } from './tabs/ClasesTab';
import { ConfiguracionTab } from './tabs/ConfiguracionTab';

interface DashboardProps {
  usuario: string;
  rol: 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TUTOR';
  onLogout: () => void;
}

export default function Dashboard({ usuario, rol, onLogout }: DashboardProps) {
  const tienePermisoAdministrativo = rol === 'ADMINISTRADOR' || rol === 'ADMINISTRATIVO';
  const esTutor = rol === 'TUTOR';

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <DashboardHeader usuario={usuario} rol={rol} onLogout={onLogout} />

        <Tabs defaultValue={esTutor ? "clases" : "instituciones"}>
          <TabsList className="flex flex-wrap h-auto gap-2">
            {/* Tabs para Administrador y Administrativo */}
            {tienePermisoAdministrativo && (
              <>
                <TabsTrigger value="instituciones">Instituciones</TabsTrigger>
                <TabsTrigger value="sedes">Sedes</TabsTrigger>
                <TabsTrigger value="aulas">Aulas</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
                <TabsTrigger value="horarios">Horarios</TabsTrigger>
                <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
              </>
            )}
            
            {/* Tabs para todos los roles */}
            <TabsTrigger value="clases">
              {esTutor ? 'Mis Clases' : 'Registro de Clases'}
            </TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
            
            {/* Tabs solo para Administrador y Administrativo */}
            {tienePermisoAdministrativo && (
              <TabsTrigger value="configuracion">Configuración</TabsTrigger>
            )}
            
            {/* Reportes para todos */}
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          {/* Contenido de los tabs */}
          {tienePermisoAdministrativo && (
            <>
              <TabsContent value="instituciones">
                <InstitucionesTab />
              </TabsContent>

              <TabsContent value="sedes">
                <SedesTab />
              </TabsContent>

              {/* Agrega los demás tabs aquí... */}
            </>
          )}

          <TabsContent value="clases">
            <ClasesTab esTutor={esTutor} rol={rol} usuario={usuario} />
          </TabsContent>

          {tienePermisoAdministrativo && (
            <TabsContent value="configuracion">
              <ConfiguracionTab />
            </TabsContent>
          )}

          {/* Más tabs... */}
        </Tabs>
      </div>
    </div>
  );
}