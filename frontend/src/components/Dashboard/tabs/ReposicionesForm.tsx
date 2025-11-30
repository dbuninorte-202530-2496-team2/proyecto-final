import React from 'react';
import type { ReposicionClase } from '../../../types/reposicion';
import type { Aula } from '../../../types/aula';
import type { Horario } from '../../../types/horario';
import type { Motivo } from '../../../types/registroClases';

export interface TutorMini {
  id: number;
  nombre: string;
}

interface ReposicionesFormProps {
  isEditing: boolean;
  formData: Partial<ReposicionClase>;
  tutores: TutorMini[];
  aulas: Aula[];
  horarios: Horario[];
  motivos: Motivo[];

  formError: string | null;
  isSubmitting: boolean;

  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const ReposicionesForm: React.FC<ReposicionesFormProps> = ({
  isEditing,
  formData,
  tutores,
  aulas,
  horarios,
  motivos,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 animate-fadeIn">
        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
          {isEditing ? 'Editar reposición de clase' : 'Registrar reposición de clase'}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Selecciona el tutor, aula y bloque de horario, y registra la fecha original
          de la clase y la nueva fecha de reposición.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Tutor */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tutor
            </label>
            <select
              name="id_tutor"
              value={formData.id_tutor ?? 0}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            >
              <option value={0} disabled>
                Selecciona un tutor
              </option>
              {tutores.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Aula */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Aula
            </label>
            <select
              name="id_aula"
              value={formData.id_aula ?? 0}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            >
              <option value={0} disabled>
                Selecciona un aula
              </option>
              {aulas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.grado}°{a.grupo} — Aula #{a.id}
                </option>
              ))}
            </select>
          </div>

          {/* Horario */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bloque de horario
            </label>
            <select
              name="id_horario"
              value={formData.id_horario ?? 0}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            >
              <option value={0} disabled>
                Selecciona un bloque de horario
              </option>
              {horarios.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.dia_sem} • {h.hora_ini} - {h.hora_fin}
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Fecha original de la clase
              </label>
              <input
                type="date"
                name="fecha_original"
                value={formData.fecha_original ?? ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nueva fecha de reposición
              </label>
              <input
                type="date"
                name="fecha_reposicion"
                value={formData.fecha_reposicion ?? ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Motivo (opcional)
            </label>
            <select
              name="id_motivo"
              value={formData.id_motivo ?? 0}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            >
              <option value={0}>Sin motivo / Otro</option>
              {motivos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.descripcion}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-green-600 text-sm font-semibold text-white hover:bg-green-700 shadow-md"
            >
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                ? 'Guardar cambios'
                : 'Registrar reposición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReposicionesForm;
