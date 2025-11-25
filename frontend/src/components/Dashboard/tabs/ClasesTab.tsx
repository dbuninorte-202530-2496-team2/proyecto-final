import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';

interface ClasesTabProps {
  esTutor: boolean;
}

export function ClasesTab({ esTutor}: ClasesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {esTutor ? 'Mis Clases y Asistencia' : 'Registro de Clases'}
        </CardTitle>
        <CardDescription>
          {esTutor 
            ? 'Control de asistencia y registro de clases dictadas'
            : 'Control de asistencia del tutor y dictado de clases'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tabla de clases aquí...</p>
        {/* Aquí irá tu componente TablaRegistrosClase */}
      </CardContent>
    </Card>
  );
}
