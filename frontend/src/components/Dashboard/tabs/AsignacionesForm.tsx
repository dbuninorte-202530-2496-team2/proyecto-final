import React, { useState, useMemo } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { TutorAula, AulaHorario } from '../../../types/asignaciones';
import type { Aula } from '../../../types/aula';
import type { Personal } from '../../../types/personal';
import type { Horario } from '../../../types/horario';

export type AsignacionMode = 'tutor_aula' | 'aula_horario';

interface AsignacionesFormProps {
  mode: AsignacionMode;
  isEditing: boolean;
  formData: Partial<TutorAula & AulaHorario>;

  aulas: Aula[];
  tutores?: Personal[];
  horarios?: Horario[];

  formError: string | null;
  isSubmitting: boolean;

  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

interface FieldErrors {
  id_aula?: string;
  id_tutor?: string;
  id_horario?: string;
  fecha_asignado?: string;
  fecha_desasignado?: string;
}

const DIAS_LABEL: Record<string, string> = {
  LU: 'Lunes',
  MA: 'Martes',
  MI: 'Miércoles',
  JU: 'Jueves',
  VI: 'Viernes',
  SA: 'Sábado',
};

const AsignacionesForm: React.FC<AsignacionesFormProps> = ({
  mode,
  isEditing,
  formData,
  aulas,
  tutores,
  horarios,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}) => {
  const isTutorAula = mode === 'tutor_aula';
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const titulo = isTutorAula
    ? isEditing
      ? 'Editar asignación Tutor ↔ Aula'
      : 'Nueva asignación Tutor ↔ Aula'
    : isEditing
    ? 'Editar asignación Aula ↔ Horario'
    : 'Nueva asignación Aula ↔ Horario';

  const descripcion = isTutorAula
    ? 'Relaciona un tutor con un aula específica.'
    : 'Relaciona un aula con uno de los bloques de horario definidos.';

  // Función para convertir string a Date de forma segura
  const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
  };

  // Validaciones detalladas de campo
  const validateField = (name: string, value: any) => {
    const errors: FieldErrors = { ...fieldErrors };

    switch (name) {
      case 'id_aula':
        if (!value || value === 0 || value === '') {
          errors.id_aula = 'Debes seleccionar un aula válida';
        } else {
          const aulaExists = aulas.find((a) => a.id === Number(value));
          if (!aulaExists) {
            errors.id_aula = 'El aula seleccionada no existe';
          } else {
            delete errors.id_aula;
          }
        }
        break;

      case 'id_tutor':
        if (!value || value === 0 || value === '') {
          errors.id_tutor = 'Debes seleccionar un tutor válido';
        } else {
          const tutorExists = tutores?.find((t) => t.id === Number(value));
          if (!tutorExists) {
            errors.id_tutor = 'El tutor seleccionado no existe';
          } else {
            delete errors.id_tutor;
          }
        }
        break;

      case 'id_horario':
        if (!value || value === 0 || value === '') {
          errors.id_horario = 'Debes seleccionar un bloque de horario válido';
        } else {
          const horarioExists = horarios?.find((h) => h.id === Number(value));
          if (!horarioExists) {
            errors.id_horario = 'El horario seleccionado no existe';
          } else {
            delete errors.id_horario;
          }
        }
        break;

      case 'fecha_asignado':
        if (!value || value === '') {
          errors.fecha_asignado = 'La fecha de asignación es obligatoria';
        } else {
          const fecha = parseDate(value);
          if (!fecha) {
            errors.fecha_asignado = 'Fecha inválida';
          } else {
            delete errors.fecha_asignado;
          }
        }
        break;

      case 'fecha_desasignado':
        if (value && value !== '') {
          const fechaAsig = parseDate(formData.fecha_asignado as string);
          const fechaDesasig = parseDate(value);

          if (!fechaDesasig) {
            errors.fecha_desasignado = 'Fecha inválida';
          } else {
            if (!fechaAsig) {
              errors.fecha_desasignado = 'Primero debe llenar la fecha de asignación';
            } else if (fechaDesasig <= fechaAsig) {
              errors.fecha_desasignado = 'Debe ser posterior a la fecha de asignación';
            } else {
              delete errors.fecha_desasignado;
            }
          }
        } else {
          delete errors.fecha_desasignado;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(e);
    validateField(name, value);
  };

  // Si cambia fecha_asignado, revalidar fecha_desasignado
  const handleDateAsignacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange(e);
    if (formData.fecha_desasignado) {
      validateField('fecha_desasignado', formData.fecha_desasignado);
    }
  };

  const getAulaLabel = (aulaId: number | undefined) => {
    if (!aulaId) return '';
    const aula = aulas.find((a) => a.id === aulaId);
    return aula ? `${aula.grado}°${aula.grupo}` : '';
  };

  const getTutorLabel = (tutorId: number | undefined) => {
    if (!tutorId) return '';
    const tutor = tutores?.find((t) => t.id === tutorId);
    return tutor ? `${tutor.nombres} ${tutor.apellidos}` : '';
  };

  const getHorarioLabel = (horarioId: number | undefined) => {
    if (!horarioId) return '';
    const horario = horarios?.find((h) => h.id === horarioId);
    return horario ? `${DIAS_LABEL[horario.dia_sem]} ${horario.hora_ini}-${horario.hora_fin}` : '';
  };

  // Calcular fecha mínima para desasignación (día siguiente a asignación)
  const minFechaDesasignacion = useMemo(() => {
    if (!formData.fecha_asignado) return '';
    const fecha = parseDate(formData.fecha_asignado as string);
    if (!fecha) return '';
    const nextDay = new Date(fecha);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, [formData.fecha_asignado]);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-900">{titulo}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-green-200 transition-colors rounded-lg"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">{descripcion}</p>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AULA */}
            <div>
              <label htmlFor="id_aula" className="block text-sm font-semibold text-gray-700 mb-2">
                Aula <span className="text-red-500">*</span>
              </label>
              <select
                id="id_aula"
                name="id_aula"
                value={formData.id_aula ?? 0}
                onChange={handleFieldChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.id_aula
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
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
              {fieldErrors.id_aula && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.id_aula}
                </p>
              )}
              {formData.id_aula && !fieldErrors.id_aula && (
                <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {getAulaLabel(formData.id_aula)} seleccionada
                </p>
              )}
            </div>

            {isTutorAula ? (
              <>
                {/* TUTOR */}
                <div>
                  <label htmlFor="id_tutor" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tutor <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="id_tutor"
                    name="id_tutor"
                    value={formData.id_tutor ?? 0}
                    onChange={handleFieldChange}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.id_tutor
                        ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                    }`}
                  >
                    <option value={0} disabled>
                      Selecciona un tutor
                    </option>
                    {tutores?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombres} {t.apellidos}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.id_tutor && (
                    <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.id_tutor}
                    </p>
                  )}
                  {formData.id_tutor && !fieldErrors.id_tutor && (
                    <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {getTutorLabel(formData.id_tutor)} seleccionado
                    </p>
                  )}
                </div>

                {/* Fecha asignado */}
                <div>
                  <label htmlFor="fecha_asignado" className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha asignación <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fecha_asignado"
                    type="date"
                    name="fecha_asignado"
                    value={formData.fecha_asignado ?? ''}
                    onChange={handleDateAsignacionChange}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.fecha_asignado
                        ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                    }`}
                  />
                  {fieldErrors.fecha_asignado && (
                    <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.fecha_asignado}
                    </p>
                  )}
                  {formData.fecha_asignado && !fieldErrors.fecha_asignado && (
                    <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Fecha válida
                    </p>
                  )}
                </div>

                {/* Fecha desasignado */}
                <div>
                  <label htmlFor="fecha_desasignado" className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha desasignación (opcional)
                  </label>
                  <input
                    id="fecha_desasignado"
                    type="date"
                    name="fecha_desasignado"
                    value={formData.fecha_desasignado ?? ''}
                    onChange={handleFieldChange}
                    min={minFechaDesasignacion}
                    disabled={!formData.fecha_asignado}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      !formData.fecha_asignado
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed text-gray-500'
                        : fieldErrors.fecha_desasignado
                        ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                    }`}
                  />
                  {!formData.fecha_asignado && (
                    <p className="mt-1 text-sm text-gray-500 font-medium flex items-center gap-1">
                      ℹ️ Primero debes seleccionar la fecha de asignación
                    </p>
                  )}
                  {fieldErrors.fecha_desasignado && formData.fecha_asignado && (
                    <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.fecha_desasignado}
                    </p>
                  )}
                  {formData.fecha_desasignado && !fieldErrors.fecha_desasignado && formData.fecha_asignado && (
                    <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Fecha válida
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* HORARIO */}
                <div>
                  <label htmlFor="id_horario" className="block text-sm font-semibold text-gray-700 mb-2">
                    Bloque de horario <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="id_horario"
                    name="id_horario"
                    value={formData.id_horario ?? 0}
                    onChange={handleFieldChange}
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.id_horario
                        ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                    }`}
                  >
                    <option value={0} disabled>
                      Selecciona un horario
                    </option>
                    {horarios?.map((h) => (
                      <option key={h.id} value={h.id}>
                        {DIAS_LABEL[h.dia_sem] ?? h.dia_sem} — {h.hora_ini} - {h.hora_fin}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.id_horario && (
                    <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.id_horario}
                    </p>
                  )}
                  {formData.id_horario && !fieldErrors.id_horario && (
                    <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {getHorarioLabel(formData.id_horario)} seleccionado
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Error general */}
          {formError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideInDown">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{formError}</p>
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <span className="text-blue-600 text-lg flex-shrink-0">💡</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Información importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Todos los campos marcados con * son obligatorios</li>
                  {isTutorAula ? (
                    <>
                      <li>La fecha de asignación no puede ser en el futuro</li>
                      <li>La fecha de desasignación debe ser posterior a la de asignación</li>
                      <li>La desasignación no puede ser en el futuro</li>
                    </>
                  ) : (
                    <li>Un aula solo puede tener un horario por bloque de tiempo</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasErrors}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                'Guardar cambios'
              ) : (
                'Crear asignación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AsignacionesForm;
