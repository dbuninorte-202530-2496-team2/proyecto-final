import React, { useEffect, useState } from 'react';
import type { Estudiante } from '../../../types/estudiante';
import type { Aula } from '../../../types/aula';
import { ArrowRightCircle, AlertCircle } from 'lucide-react';

interface MoverEstudianteFormProps {
  isOpen: boolean;
  estudiante: Estudiante | null;
  aulaActual: Aula | null;
  aulasDestino: Aula[];
  onClose: () => void;
  onConfirm: (idAulaDestino: number) => void;
}

const MoverEstudianteForm: React.FC<MoverEstudianteFormProps> = ({
  isOpen,
  estudiante,
  aulaActual,
  aulasDestino,
  onClose,
  onConfirm,
}) => {
  const [aulaDestinoId, setAulaDestinoId] = useState<number | 0>(0);

  useEffect(() => {
    if (!isOpen) return;
    if (aulasDestino.length > 0) {
      setAulaDestinoId(aulasDestino[0].id);
    } else {
      setAulaDestinoId(0);
    }
  }, [isOpen, aulasDestino]);

  if (!isOpen || !estudiante) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aulaDestinoId) return;
    onConfirm(aulaDestinoId);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-emerald-100 border-b-2 border-emerald-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
            <ArrowRightCircle className="w-5 h-5" />
            Mover estudiante de aula
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-emerald-200 transition-colors rounded-lg"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-600 mb-2">
            Solo se permite mover estudiantes entre aulas del mismo tipo de programa:
            <span className="font-semibold text-emerald-700"> 4º–5º (Inside)</span> o
            <span className="font-semibold text-indigo-700"> 9º–10º (Outside)</span>.
          </p>

          {/* Info del estudiante */}
          <div className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
            <p className="font-semibold text-gray-800">
              Estudiante:
            </p>
            <p className="text-gray-700">
              {estudiante.nombres} {estudiante.apellidos} — {estudiante.num_doc}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Aula actual:</span>{' '}
              {aulaActual
                ? `${aulaActual.grado}°${aulaActual.grupo} (Aula #${aulaActual.id})`
                : 'Sin aula asignada'}
            </p>
          </div>

          {aulasDestino.length === 0 ? (
            <div className="flex items-start gap-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs text-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                No hay aulas destino compatibles (del mismo tipo de programa)
                para mover a este estudiante.
              </p>
            </div>
          ) : (
            <>
              {/* Aula destino */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Aula destino
                </label>
                <select
                  value={aulaDestinoId || ''}
                  onChange={(e) => setAulaDestinoId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 hover:border-emerald-300 text-sm"
                >
                  {aulasDestino.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.grado}°{a.grupo} — Aula #{a.id}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Solo se muestran aulas del mismo tipo de programa que el aula actual.
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!aulaDestinoId}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  Confirmar movimiento
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default MoverEstudianteForm;
