import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, XCircle, CalendarDays, Users, CheckCircle2, AlertCircle, Loader, AlertTriangle } from 'lucide-react';

export function ClasesTab() {
  const { usuario, rol } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(hoy);
  const [selectedAula, setSelectedAula] = useState<string>('');

  // Reposición
  const [huboClase, setHuboClase] = useState<boolean>(true);
  const [motivo, setMotivo] = useState<string>('');
  const [fechaReposicion, setFechaReposicion] = useState<string>('');

  if (!usuario || !rol) return null;

  const esTutor = rol === 'TUTOR';

  const motivos = [
    { id: 1, nombre: 'Festivo' },
    { id: 2, nombre: 'Motivo personal' },
    { id: 3, nombre: 'Fuerza mayor' },
  ];

  const misAulas = [
    { id: 1, nombre: 'INSIDECLASSROOM - Aula 101' },
    { id: 2, nombre: 'OUTSIDECLASSROOM - Aula 201' },
  ];

  const estudiantes = [
    { id: 1, nombre: 'Juan Pérez', presente: true },
    { id: 2, nombre: 'María González', presente: false },
    { id: 3, nombre: 'Carlos Ramírez', presente: true },
  ];

  // Estado asistencia
  const [asistencia, setAsistencia] = useState<Record<number, boolean>>(() => {
    const inicial: Record<number, boolean> = {};
    estudiantes.forEach((est) => {
      inicial[est.id] = est.presente;
    });
    return inicial;
  });

  const handleToggleAsistencia = (id: number) => {
    setAsistencia((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Estadísticas
  const estadisticas = useMemo(() => {
    const presentes = estudiantes.filter((e) => asistencia[e.id] === true).length;
    const ausentes = estudiantes.length - presentes;
    const porcentaje = estudiantes.length === 0 ? 0 : Math.round((presentes / estudiantes.length) * 100);

    return { presentes, ausentes, porcentaje };
  }, [asistencia]);

  // ✅ VALIDACIONES MEJORADAS
  const validarFormulario = (): { valido: boolean; mensaje?: string } => {
    // 1. Validar aula seleccionada
    if (!selectedAula || selectedAula === '') {
      return { valido: false, mensaje: 'Debes seleccionar un aula' };
    }

    // 2. Validar fecha
    if (!selectedDate) {
      return { valido: false, mensaje: 'Debes seleccionar una fecha' };
    }

    // 3. Validar que la fecha no sea futura
    if (selectedDate > hoy) {
      return { valido: false, mensaje: 'No puedes registrar asistencia para fechas futuras' };
    }

    // 4. Validar antigüedad de la fecha (opcional: máximo 30 días atrás)
    const fechaSeleccionada = new Date(selectedDate);
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    if (fechaSeleccionada < hace30Dias) {
      return { valido: false, mensaje: 'No puedes registrar asistencia para fechas mayores a 30 días' };
    }

    // 5. Si NO hubo clase, validar motivo
    if (!huboClase) {
      if (!motivo || motivo === '') {
        return { valido: false, mensaje: 'Debes seleccionar un motivo de ausencia' };
      }

      // 6. Validar fecha de reposición si se proporciona
      if (fechaReposicion) {
        if (fechaReposicion <= selectedDate) {
          return { valido: false, mensaje: 'La fecha de reposición debe ser posterior a la fecha de la clase' };
        }

        // Validar que la reposición no sea demasiado lejana (opcional: máximo 60 días)
        const fechaRepo = new Date(fechaReposicion);
        const fechaClase = new Date(selectedDate);
        const diferenciaDias = Math.floor((fechaRepo.getTime() - fechaClase.getTime()) / (1000 * 60 * 60 * 24));

        if (diferenciaDias > 60) {
          return { valido: false, mensaje: 'La fecha de reposición no puede ser mayor a 60 días desde la clase original' };
        }
      }
    }

    // 7. Si SÍ hubo clase, validar que haya al menos un estudiante
    if (huboClase && estudiantes.length === 0) {
      return { valido: false, mensaje: 'No hay estudiantes registrados en esta aula' };
    }

    return { valido: true };
  };

  const handleGuardarAsistencia = async () => {
    // Limpiar error previo
    setError(null);

    // Validar formulario
    const validacion = validarFormulario();
    if (!validacion.valido) {
      setError(validacion.mensaje || 'Error de validación');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        fecha_clase: selectedDate,
        aula: selectedAula,
        huboClase,
        motivo: huboClase ? null : motivo,
        fechaReposicion: huboClase ? null : (fechaReposicion || null),
        asistencia: huboClase ? asistencia : null,
      };

      console.log('Payload enviado al backend:', payload);

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Aquí iría la llamada real a la API
      // const response = await apiService.guardarAsistencia(payload);

      alert('✅ Registro guardado correctamente');

      // Opcional: Resetear formulario después de guardar
      // resetFormulario();

    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al guardar el registro. Por favor, intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Función opcional para resetear el formulario
  const resetFormulario = () => {
    setSelectedDate(hoy);
    setHuboClase(true);
    setMotivo('');
    setFechaReposicion('');
    const inicial: Record<number, boolean> = {};
    estudiantes.forEach((est) => {
      inicial[est.id] = true;
    });
    setAsistencia(inicial);
    setError(null);
  };

  // ✅ Validación en tiempo real para el botón
  const formularioValido = useMemo(() => {
    return validarFormulario().valido;
  }, [selectedAula, selectedDate, huboClase, motivo, fechaReposicion]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary-600" />
              {esTutor ? 'Tomar Asistencia' : 'Registro de Clases'}
            </CardTitle>
            <CardDescription>
              {esTutor
                ? 'Registra la asistencia de tus estudiantes y reporta reposiciones'
                : 'Control de asistencia y dictado de clases'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ✅ MENSAJE DE ERROR */}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-1">Por favor, corrige los errores para continuar.</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* FILTROS */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                max={hoy}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setError(null);
                }}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white font-medium transition-all hover:border-primary-300 ${!selectedDate ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
            </div>

            {esTutor && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aula <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedAula}
                  onChange={(e) => {
                    setSelectedAula(e.target.value);
                    setError(null);
                  }}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white font-medium transition-all hover:border-primary-300 ${!selectedAula ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Selecciona un aula</option>
                  {misAulas.map((aula) => (
                    <option key={aula.id} value={aula.id}>
                      {aula.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botón limpiar fechas */}
          {selectedDate !== hoy && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setSelectedDate(hoy);
                  setError(null);
                }}
                className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
              >
                Limpiar fecha (volver a hoy)
              </button>
            </div>
          )}
        </div>

        {/* SECCIÓN: ¿HUBO CLASE? */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            ¿Se dictó la clase este día? <span className="text-red-600">*</span>
          </h3>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                checked={huboClase === true}
                onChange={() => {
                  setHuboClase(true);
                  setError(null);
                }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="font-medium">Sí hubo clase</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                checked={huboClase === false}
                onChange={() => {
                  setHuboClase(false);
                  setError(null);
                }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="font-medium">No hubo clase</span>
            </label>
          </div>

          {/* SI NO HUBO CLASE */}
          {!huboClase && (
            <div className="space-y-3 p-4 border-2 border-red-300 rounded-lg bg-gradient-to-br from-red-50 to-red-100 animate-fadeIn">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Motivo de la ausencia <span className="text-red-600">*</span>
                </label>
                <select
                  value={motivo}
                  onChange={(e) => {
                    setMotivo(e.target.value);
                    setError(null);
                  }}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-white font-medium ${!motivo ? 'border-red-400' : 'border-gray-300'
                    }`}
                >
                  <option value="">Seleccione un motivo</option>
                  {motivos.map((m) => (
                    <option key={m.id} value={m.nombre}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Fecha de reposición (opcional)
                </label>
                <input
                  type="date"
                  value={fechaReposicion}
                  min={selectedDate}
                  onChange={(e) => {
                    setFechaReposicion(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-white font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* LISTA ESTUDIANTES */}
        {huboClase && (
          <>
            <div className="space-y-3 animate-fadeIn">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Lista de Estudiantes
              </h3>

              <div className="space-y-2">
                {estudiantes.map((est) => (
                  <div
                    key={est.id}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all"
                  >
                    <span className="text-gray-900 font-medium">{est.nombre}</span>

                    <button
                      onClick={() => handleToggleAsistencia(est.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md ${asistencia[est.id]
                          ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-300 hover:from-emerald-200 hover:to-emerald-300'
                          : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300 hover:from-red-200 hover:to-red-300'
                        }`}
                    >
                      {asistencia[est.id] ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Presente
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Ausente
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-800" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-semibold">Total Estudiantes</p>
                    <p className="text-3xl font-bold text-emerald-900">{estudiantes.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-sky-800" />
                  </div>
                  <div>
                    <p className="text-sm text-sky-600 font-semibold">Presentes</p>
                    <p className="text-3xl font-bold text-sky-900">{estadisticas.presentes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-800" />
                  </div>
                  <div>
                    <p className="text-sm text-red-600 font-semibold">
                      Ausentes ({estadisticas.porcentaje}%)
                    </p>
                    <p className="text-3xl font-bold text-red-900">{estadisticas.ausentes}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* BOTÓN GUARDAR */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleGuardarAsistencia}
            disabled={isSaving || !formularioValido}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${!isSaving && formularioValido
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Asistencia'
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}