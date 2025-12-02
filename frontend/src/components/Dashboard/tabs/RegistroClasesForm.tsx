import React, { useMemo } from 'react';
import type { Estudiante } from '../../../types/estudiante';
import type { Motivo, Semana } from '../../../types/registroClases';
import type { Aula } from '../../../types/aula';
import type { Horario } from '../../../types/horario';
import type { Personal } from '../../../types/personal';
import { CheckCircle2, XCircle, AlertCircle, CalendarDays, Clock3, Loader } from 'lucide-react';

interface RegistroClasesFormProps {
  fecha: string;
  semana: Semana | null;
  tutor: Personal | null;
  aula: Aula | null;
  horario: Horario | null;
  estudiantes: Estudiante[];
  motivos: Motivo[];
  asistencia: {
    [idEstudiante: number]: {
      asistio: boolean;
      id_motivo: number | null;
    };
  };
  isSaving: boolean;
  error: string | null;
  onToggleAsistencia: (idEstudiante: number) => void;
  onChangeMotivo: (idEstudiante: number, idMotivo: number | null) => void;

  // Props para "Hubo Clase"
  huboClase: boolean;
  motivoNoClase: string;
  fechaReposicion: string;
  setHuboClase: (val: boolean) => void;
  setMotivoNoClase: (val: string) => void;
  setFechaReposicion: (val: string) => void;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const RegistroClasesForm: React.FC<RegistroClasesFormProps> = ({
  fecha,
  semana,
  tutor,
  aula,
  horario,
  estudiantes,
  motivos,
  asistencia,
  isSaving,
  error,
  onToggleAsistencia,
  onChangeMotivo,
  huboClase,
  motivoNoClase,
  fechaReposicion,
  setHuboClase,
  setMotivoNoClase,
  setFechaReposicion,
  onSubmit,
}) => {
  // Validar que todos los campos requeridos están presentes
  const isValid = useMemo(() => {
    const basicValid = fecha && tutor && aula && horario;
    if (!basicValid) return false;

    if (huboClase) {
      return estudiantes.length > 0;
    } else {
      // Si no hubo clase, debe tener motivo
      // Y si tiene fecha de reposición, debe tener estudiantes para registrar asistencia
      const tieneMotivo = motivoNoClase.trim() !== '';
      if (fechaReposicion) {
        return tieneMotivo && estudiantes.length > 0;
      }
      return tieneMotivo;
    }
  }, [fecha, tutor, aula, horario, estudiantes, huboClase, motivoNoClase, fechaReposicion]);

  // Calcular estadísticas en tiempo real
  const stats = useMemo(() => {
    const presentes = estudiantes.filter((e) => (asistencia[e.id]?.asistio ?? true) === true).length;
    const ausentes = estudiantes.length - presentes;
    const conMotivo = Object.values(asistencia).filter((a) => a.id_motivo != null).length;

    return { presentes, ausentes, conMotivo };
  }, [estudiantes, asistencia]);

  return (
    <div className="mt-6 border border-green-100 rounded-xl overflow-hidden shadow-sm bg-white animate-fadeIn">
      {/* Encabezado de sesión con información */}
      <div className="bg-gradient-to-r from-green-50 via-green-50 to-blue-50 border-b border-green-100 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del aula */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {aula ? `${aula.grado}` : '–'}
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-green-700 font-semibold">Aula</div>
              <div className="text-sm font-semibold text-gray-900">
                {aula ? `${aula.grado}°${aula.grupo}` : 'Sin aula'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {tutor ? `${tutor.nombres} ${tutor.apellidos}` : 'Sin tutor'}
              </div>
            </div>
          </div>

          {/* Información de fecha y horario */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-lg text-xs font-semibold text-green-800 shadow-sm hover:shadow-md transition-shadow">
              <CalendarDays className="w-4 h-4 text-green-600" />
              <span>{fecha || 'Sin fecha'}</span>
              {semana && (
                <span className="text-[10px] text-green-600 ml-1">
                  Semana {semana.id}
                </span>
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 shadow-sm hover:shadow-md transition-shadow">
              <Clock3 className="w-4 h-4 text-blue-600" />
              <span>{horario ? `${horario.hora_ini} - ${horario.hora_fin}` : 'Sin horario'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radio buttons para "Hubo Clase" */}
      <form onSubmit={onSubmit}>
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-700">¿Se dictó la clase?</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="huboClase"
                  checked={huboClase === true}
                  onChange={() => setHuboClase(true)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Sí, se dictó</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="huboClase"
                  checked={huboClase === false}
                  onChange={() => setHuboClase(false)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">No se dictó</span>
              </label>
            </div>
          </div>
        </div>

        {/* Campos condicionales si NO hubo clase */}
        {!huboClase && (
          <div className="p-6 bg-red-50/50 space-y-4 animate-fadeIn border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo de no clase <span className="text-red-500">*</span>
                </label>
                <select
                  value={motivoNoClase}
                  onChange={(e) => setMotivoNoClase(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option value="">Selecciona un motivo...</option>
                  <option value="Permiso Personal">Permiso Personal</option>
                  <option value="Incapacidad Médica">Incapacidad Médica</option>
                  <option value="Actividad Institucional">Actividad Institucional</option>
                  <option value="Calamidad Doméstica">Calamidad Doméstica</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha en que se repuso la clase (opcional)
                </label>
                <input
                  type="date"
                  value={fechaReposicion}
                  onChange={(e) => setFechaReposicion(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Si ya repusiste esta clase, ingresa la fecha para registrar la asistencia
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de asistencia - solo si hubo clase O si hay fecha de reposición */}
        {(huboClase || (!huboClase && fechaReposicion)) && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Asistencia</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                      Selecciona tutor, aula y horario para ver los estudiantes.
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((est, idx) => {
                    const estado = asistencia[est.id] ?? { asistio: true, id_motivo: null };
                    const tieneMotivo = estado.id_motivo != null && !estado.asistio;

                    return (
                      <tr
                        key={est.id}
                        className={`transition-all duration-200 hover:bg-green-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                              {est.nombres.charAt(0)}{est.apellidos.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {est.nombres} {est.apellidos}
                              </div>
                              <div className="text-xs text-gray-500">{est.num_doc}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => onToggleAsistencia(est.id)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-all transform hover:scale-105 duration-200 ${estado.asistio
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-150'
                                : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-150'
                                }`}
                            >
                              {estado.asistio ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Presente</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  <span>Ausente</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={estado.id_motivo ?? 0}
                            onChange={(e) =>
                              onChangeMotivo(
                                est.id,
                                e.target.value === '0' ? null : Number(e.target.value),
                              )
                            }
                            disabled={estado.asistio}
                            className={`w-full px-3 py-2 border-2 rounded-lg text-xs font-medium transition-all ${estado.asistio
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600'
                              }`}
                          >
                            <option value={0} className="text-gray-500">
                              {tieneMotivo ? '✓ Motivo seleccionado' : 'Selecciona motivo...'}
                            </option>
                            {motivos.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.descripcion}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Barra de estadísticas rápidas - solo si hubo clase O si hay fecha de reposición */}
        {(huboClase || (!huboClase && fechaReposicion)) && estudiantes.length > 0 && (
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50 border-y border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.presentes}</div>
              <div className="text-xs font-semibold text-gray-600">Presentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.ausentes}</div>
              <div className="text-xs font-semibold text-gray-600">Ausentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.conMotivo}</div>
              <div className="text-xs font-semibold text-gray-600">Con motivo</div>
            </div>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-t-2 border-red-200 flex items-center gap-3 text-sm text-red-700 animate-slideDown">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botón de envío */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !isValid}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all transform ${isSaving || !isValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105 shadow-md'
              } duration-200`}
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar registro de clase</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroClasesForm;
