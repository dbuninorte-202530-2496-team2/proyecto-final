import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

export function ClasesTab() {
  const { usuario, rol } = useAuth();

  // Fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(hoy);
  const [selectedAula, setSelectedAula] = useState<string>('1');

  // Reposición
  const [huboClase, setHuboClase] = useState<boolean>(true);
  const [motivo, setMotivo] = useState<string>('');
  const [fechaReposicion, setFechaReposicion] = useState<string>("");

  if (!usuario || !rol) return null;

  const esTutor = rol === 'TUTOR';

  const motivos = [
    { id: 1, nombre: "Festivo" },
    { id: 2, nombre: "Motivo personal" },
    { id: 3, nombre: "Fuerza mayor" }
  ];

  const misAulas = [
    { id: 1, nombre: 'INSIDECLASSROOM - Aula 101' },
    { id: 2, nombre: 'OUTSIDECLASSROOM - Aula 201' }
  ];

  const estudiantes = [
    { id: 1, nombre: 'Juan Pérez', presente: true },
    { id: 2, nombre: 'María González', presente: false },
    { id: 3, nombre: 'Carlos Ramírez', presente: true },
  ];

  // Estado asistencia
  const [asistencia, setAsistencia] = useState<Record<number, boolean>>(() => {
    const inicial: Record<number, boolean> = {};
    estudiantes.forEach(est => {
      inicial[est.id] = est.presente;
    });
    return inicial;
  });

  const handleToggleAsistencia = (id: number) => {
    setAsistencia(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGuardarAsistencia = () => {
    // Validación opcional (evitar reposición antes de la fecha original)
    if (!huboClase && fechaReposicion && fechaReposicion < selectedDate) {
      alert("La fecha de reposición no puede ser anterior a la fecha de la clase.");
      return;
    }

    const payload = {
      fecha_clase: selectedDate,                   // YYYY-MM-DD
      aula: selectedAula,                          // string
      huboClase,                                   // boolean
      motivo: huboClase ? null : motivo,           // string | null
      fechaReposicion: huboClase ? null : (fechaReposicion || null), // YYYY-MM-DD | null
      asistencia: huboClase ? asistencia : null    // Record<number,boolean> | null
    };

    console.log("Payload enviado al backend:", payload);

    alert("Registro guardado correctamente");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {esTutor ? 'Tomar Asistencia' : 'Registro de Clases'}
        </CardTitle>
        <CardDescription>
          {esTutor
            ? 'Registra la asistencia de tus estudiantes y reporta reposiciones'
            : 'Control de asistencia y dictado de clases'}
        </CardDescription>
      </CardHeader>

      <CardContent>

        {/* FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {esTutor && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Aula</label>
              <select
                value={selectedAula}
                onChange={(e) => setSelectedAula(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {misAulas.map(aula => (
                  <option key={aula.id} value={aula.id}>{aula.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* SECCIÓN: ¿HUBO CLASE? */}
        <div className="mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">¿Se dictó la clase este día?</h3>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={huboClase === true}
                onChange={() => setHuboClase(true)}
              />
              Sí hubo clase
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={huboClase === false}
                onChange={() => setHuboClase(false)}
              />
              No hubo clase
            </label>
          </div>

          {/* SI NO HUBO CLASE */}
          {!huboClase && (
            <div className="space-y-3 p-4 border rounded-lg bg-red-50">

              <div>
                <label className="block font-medium text-gray-700">
                  Motivo de la ausencia
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccione un motivo</option>
                  {motivos.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Fecha de reposición (opcional)
                </label>
                <input
                  type="date"
                  value={fechaReposicion}
                  onChange={(e) => setFechaReposicion(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

            </div>
          )}
        </div>

        {/* LISTA ESTUDIANTES */}
        {huboClase && (
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">Lista de Estudiantes</h3>

            {estudiantes.map(est => (
              <div
                key={est.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <span className="text-gray-900">{est.nombre}</span>

                <button
                  onClick={() => handleToggleAsistencia(est.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    asistencia[est.id]
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {asistencia[est.id] ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Presente
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Ausente
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BOTÓN GUARDAR */}
        <button
          onClick={handleGuardarAsistencia}
          className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          Guardar Registro
        </button>

      </CardContent>
    </Card>
  );
}
