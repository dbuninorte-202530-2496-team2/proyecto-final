import React, { useMemo } from 'react';
import type { Estudiante } from '../../../types/estudiante';
import type { Componente, Nota } from '../../../types/nota';
import type { Aula } from '../../../types/aula';
import type { Personal } from '../../../types/personal';
import { AlertCircle, CheckCircle2, BookOpen, FileText, Loader } from 'lucide-react';

interface NotasFormProps {
  tutor: Personal | null;
  aula: Aula | null;
  componente: Componente | null;
  estudiantes: Estudiante[];
  notas: {
    [idEstudiante: number]: {
      valor: number | '';
      comentario: string;
    };
  };
  notasGuardadas: Nota[]; // New prop
  isSaving: boolean;
  error: string | null;
  onChangeValor: (idEstudiante: number, valor: number | '') => void;
  onChangeComentario: (idEstudiante: number, comentario: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const NotasForm: React.FC<NotasFormProps> = ({
  tutor,
  aula,
  componente,
  estudiantes,
  notas,
  notasGuardadas,
  isSaving,
  error,
  onChangeValor,
  onChangeComentario,
  onSubmit,
}) => {
  // Validaciones 
  const notasValidadas = useMemo(() => {
    const validadas: {
      [id: number]: { valor: number | ''; comentario: string; error?: string; isModified: boolean; isSaved: boolean };
    } = {};

    estudiantes.forEach((est) => {
      const pending = notas[est.id];
      // Buscar nota guardada para este estudiante y componente
      const saved = notasGuardadas.find(n => n.id_estudiante === est.id && n.id_comp === componente?.id);

      let valor: number | '' = '';
      let comentario = '';
      let isModified = false;
      let isSaved = false;

      if (pending) {
        // Si hay cambios pendientes, tienen prioridad visual
        valor = pending.valor;
        comentario = pending.comentario;
        isModified = true;
      } else if (saved) {
        // Si no hay pendientes, mostrar lo guardado
        valor = saved.valor;
        comentario = saved.comentario || '';
        isSaved = true;
      }

      const errorMsg: string | undefined =
        valor !== '' && (typeof valor === 'number' && (valor < 0 || valor > 100))
          ? 'Debe estar entre 0-100'
          : undefined;

      validadas[est.id] = { valor, comentario, error: errorMsg, isModified, isSaved };
    });

    return validadas;
  }, [notas, estudiantes, notasGuardadas, componente]);

  // Contadores en tiempo real
  const estadisticas = useMemo(() => {
    const conNotas = estudiantes.filter((e) => {
      const n = notasValidadas[e.id];
      return n && n.valor !== '';
    }).length;

    const conError = Object.values(notasValidadas).filter((n) => n.error).length;
    const total = estudiantes.length;

    return { conNotas, conError, total };
  }, [estudiantes, notasValidadas]);

  // Determinar si el formulario es válido
  const isFormValid = useMemo(() => {
    if (estudiantes.length === 0) return false;
    if (estadisticas.conNotas === 0) return false;
    if (estadisticas.conError > 0) return false;
    return true;
  }, [estudiantes.length, estadisticas]);

  const getInitials = (nombre: string, apellidos: string): string => {
    const n = nombre.split(' ')[0]?.[0] ?? '';
    const a = apellidos.split(' ')[0]?.[0] ?? '';
    return (n + a).toUpperCase();
  };

  return (
    <div className="mt-4 border border-green-100 rounded-xl overflow-hidden shadow-sm animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-green-50 via-green-50 to-blue-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-green-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {aula ? `${aula.grado}` : '–'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-green-700 font-bold">
              Sesión de Notas
            </span>
            <span className="text-sm font-semibold text-green-900">
              {aula ? `Grado ${aula.grado}°${aula.grupo}` : 'Aula no seleccionada'}
            </span>
            <span className="text-xs text-gray-600">
              {tutor ? `Tutor: ${tutor.nombre} ${tutor.apellido || ''}` : 'Tutor no seleccionado'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-200 text-xs font-semibold text-indigo-700 shadow-sm">
            <BookOpen className="w-4 h-4" />
            {componente ? componente.nombre : '—'}
          </div>
          {componente && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-semibold text-purple-700 shadow-sm">
              <FileText className="w-4 h-4" />
              Peso: {componente.porcentaje}%
            </div>
          )}
        </div>
      </div>

      {/* Tabla de notas */}
      <form onSubmit={onSubmit}>
        {estudiantes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Selecciona tutor, aula y componente para ver los estudiantes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-green-100 border-y border-green-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Estudiante</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Nota (0–100)</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Comentario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estudiantes.map((est, idx) => {
                  const notaData = notasValidadas[est.id];
                  // const hasNota = notaData.valor !== ''; // Removed unused
                  const hasError = !!notaData.error;
                  const isSaved = notaData.isSaved;
                  const isModified = notaData.isModified;

                  return (
                    <tr
                      key={est.id}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-green-50 transition-colors duration-150`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(est.nombre, est.apellidos)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {est.nombre} {est.apellidos}
                            </p>
                            <p className="text-xs text-gray-500">{est.codigo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={notaData.valor}
                            onChange={(e) =>
                              onChangeValor(
                                est.id,
                                e.target.value === '' ? '' : Number(e.target.value),
                              )
                            }
                            className={`w-20 px-3 py-2 border-2 rounded-lg text-sm font-medium text-center transition-all ${hasError
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : isModified
                                ? 'border-yellow-400 bg-yellow-50 text-gray-900 ring-1 ring-yellow-400' // Modificado
                                : isSaved
                                  ? 'border-green-200 bg-green-50 text-green-800 font-bold' // Guardado
                                  : 'border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600'
                              } focus:outline-none`}
                            placeholder="—"
                          />
                          {isSaved && !isModified && !hasError && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                          {isModified && !hasError && (
                            <div className="w-2 h-2 rounded-full bg-yellow-400" title="Modificado (sin guardar)" />
                          )}
                          {hasError && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        {hasError && (
                          <p className="text-xs text-red-600 mt-1 font-medium">{notaData.error}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="text"
                          value={notaData.comentario}
                          onChange={(e) => onChangeComentario(est.id, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                          placeholder="Observaciones..."
                          maxLength={150}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Barra rápida de estadísticas */}
        {estudiantes.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-center text-center">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Progreso</p>
              <p className="text-lg font-bold text-green-700">
                {estadisticas.conNotas}/{estadisticas.total} <span className="text-sm text-gray-500 font-normal">({Math.round((estadisticas.conNotas / estadisticas.total) * 100)}%)</span>
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t-2 border-red-200 flex items-center gap-3 text-sm text-red-700 animate-slideDown">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Botón de envío */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !isFormValid}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${isFormValid && !isSaving
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
              'Guardar Notas'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotasForm;