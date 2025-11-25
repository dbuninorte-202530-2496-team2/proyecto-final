import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function AsignacionesTab() {
  const { usuario, rol } = useAuth();

  if (!usuario || !rol) return null;

  // TODO: Obtener asignaciones del tutor desde la API
  const asignaciones = [
    {
      id: 1,
      aula: 'INSIDECLASSROOM - Aula 101',
      institucion: 'IED Simón Bolívar',
      sede: 'Sede Principal',
      horario: 'Lunes y Miércoles 8:00 AM - 10:00 AM',
      estudiantes: 25
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Aulas Asignadas</CardTitle>
        <CardDescription>
          Aulas y horarios donde estás asignado como tutor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {asignaciones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tienes aulas asignadas actualmente</p>
            </div>
          ) : (
            asignaciones.map((asignacion) => (
              <div
                key={asignacion.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {asignacion.aula}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {asignacion.institucion} - {asignacion.sede}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {asignacion.estudiantes} estudiantes
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{asignacion.horario}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
