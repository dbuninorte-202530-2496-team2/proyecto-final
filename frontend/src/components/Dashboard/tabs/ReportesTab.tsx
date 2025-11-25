import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';

export function ReportesTab() {
  const { usuario, rol } = useAuth();

  if (!usuario || !rol) return null;

  const esTutor = rol === 'TUTOR';

  // Simulación de asistencias reales de la API
  const asistencias = [
    { fecha: '2024-01-10', estado: 'Asistió' },
    { fecha: '2024-01-12', estado: 'Asistió' },
    { fecha: '2024-01-15', estado: 'No asistió', motivo: 'Festivo' },
    { fecha: '2024-02-01', estado: 'Asistió' },
    { fecha: '2024-02-20', estado: 'No asistió', motivo: 'Permiso personal' },
    { fecha: '2024-03-02', estado: 'Asistió' }
  ];

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporteFiltrado, setReporteFiltrado] = useState<any[]>([]);

  const handleFiltrar = () => {
  if (!fechaInicio || !fechaFin) {
    alert("Selecciona ambas fechas");
    return;
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (fin < inicio) {
    alert("La fecha final no puede ser menor que la fecha inicial.");
    return;
  }

  const filtrado = asistencias.filter(a => {
    const fecha = new Date(a.fecha);
    return fecha >= inicio && fecha <= fin;
  });

  setReporteFiltrado(filtrado);
};

  return (
    <div className="space-y-6">

      {/* Reporte general */}
      {esTutor && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Asistencia por Rango de Fechas</CardTitle>
            <CardDescription>
              Consulta tus asistencias dentro de un periodo específico.
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleFiltrar}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Generar Reporte
                </button>
              </div>
            </div>

            {/* Resultados */}
            {reporteFiltrado.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Resultados:</h3>

                {reporteFiltrado.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.fecha}</span>
                      <span className={item.estado === "Asistió" ? "text-green-600" : "text-red-600"}>
                        {item.estado}
                      </span>
                    </div>

                    {item.motivo && (
                      <p className="text-sm text-gray-600">Motivo: {item.motivo}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay datos para el rango seleccionado.</p>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
