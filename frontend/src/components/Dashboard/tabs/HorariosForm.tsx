import React, { useState, useMemo } from 'react';
import { X, AlertCircle, Clock } from 'lucide-react';
import type { Horario } from '../../../types/horario';

interface HorariosFormProps {
  isEditing: boolean;
  formData: Partial<Horario & { _duracionLabel?: string }>;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface FieldErrors {
  dia_sem?: string;
  hora_ini?: string;
  hora_fin?: string;
  duracion?: string;
}

const DIAS = [
  { value: 'LU', label: 'Lunes' },
  { value: 'MA', label: 'Martes' },
  { value: 'MI', label: 'Miércoles' },
  { value: 'JU', label: 'Jueves' },
  { value: 'VI', label: 'Viernes' },
  { value: 'SA', label: 'Sábado' },
];

const DURACIONES_VALIDAS = [40, 45, 50, 55, 60];

// Horas 
const timeToMinutes = (timeStr: string): number | null => {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

// Calcular minutos entre las dos horas
const duracionMinutos = (ini: string, fin: string): number => {
  const iniMin = timeToMinutes(ini);
  const finMin = timeToMinutes(fin);
  if (iniMin === null || finMin === null) return -1;
  return finMin - iniMin;
};

const generateHours = (): { value: string; label: string }[] => {
  const hours: { value: string; label: string }[] = [];
  // Solo generar horas de 06:00 a 18:00 (rango operativo de instituciones)
  for (let h = 6; h <= 18; h++) {
    const startMin = h === 18 ? 0 : 0; // Si es hora 18, solo 18:00
    const endMin = h === 18 ? 0 : 55;  // Si es hora 18, solo 18:00

    for (let m = startMin; m <= endMin; m += 5) {
      hours.push({
        value: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      });
    }
  }
  return hours;
};

interface HoraSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error: boolean;
}

const HoraSelect: React.FC<HoraSelectProps> = ({ id, name, value, onChange, error }) => {
  const horasDisponibles = useMemo(() => generateHours(), []);

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${error
        ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
        : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
        }`}
    >
      <option value="" disabled>
        Selecciona una hora
      </option>
      {horasDisponibles.map((hora) => (
        <option key={hora.value} value={hora.value}>
          {hora.label}
        </option>
      ))}
    </select>
  );
};

const HorariosForm: React.FC<HorariosFormProps> = ({
  isEditing,
  formData,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}) => {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Validar campos 
  const validateField = (name: string, value: any, currentFormData?: Partial<Horario>) => {
    const errors: FieldErrors = { ...fieldErrors };
    const fData = currentFormData || formData;

    switch (name) {
      case 'dia_sem':
        if (!value || value === '' || value === 'LU') {
          const validDias = DIAS.map((d) => d.value);
          if (!validDias.includes(value)) {
            errors.dia_sem = 'Debes seleccionar un día de la semana válido';
          } else {
            delete errors.dia_sem;
          }
        } else {
          delete errors.dia_sem;
        }
        break;

      case 'hora_ini': {
        const errores: string[] = [];

        // Validación 1: Campo requerido
        if (!value || value.trim() === '') {
          errores.push('La hora de inicio es obligatoria');
        } else {
          // Validación 2: Formato correcto HH:MM
          if (!/^\d{2}:\d{2}$/.test(value)) {
            errores.push('Formato inválido, usa HH:MM');
          } else {
            const mins = timeToMinutes(value);

            // Validación 3: Rango de horas válidas (0-23)
            if (mins === null) {
              errores.push('Hora fuera de rango válido (00:00 - 23:59)');
            }

            // Validación 4: Comparación con hora fin
            if (fData.hora_fin && fData.hora_fin.trim() !== '') {
              const iniMin = timeToMinutes(value);
              const finMin = timeToMinutes(fData.hora_fin);

              if (iniMin !== null && finMin !== null) {
                if (iniMin >= finMin) {
                  errores.push('Debe ser menor que la hora de fin');
                  errors.hora_fin = 'Debe ser mayor que la hora de inicio';
                } else {
                  delete errors.hora_fin;
                }
              }
            }
          }
        }

        if (errores.length > 0) {
          errors.hora_ini = errores.join('. ');
        } else {
          delete errors.hora_ini;
        }
        break;
      }

      case 'hora_fin': {
        const errores: string[] = [];

        // Validación 1: Campo requerido
        if (!value || value.trim() === '') {
          errores.push('La hora de fin es obligatoria');
        } else {
          // Validación 2: Formato correcto HH:MM
          if (!/^\d{2}:\d{2}$/.test(value)) {
            errores.push('Formato inválido, usa HH:MM');
          } else {
            const mins = timeToMinutes(value);

            // Validación 3: Rango de horas válidas (0-23)
            if (mins === null) {
              errores.push('Hora fuera de rango válido (00:00 - 23:59)');
            }

            // Validación 4: Comparación con hora ini
            if (fData.hora_ini && fData.hora_ini.trim() !== '') {
              const iniMin = timeToMinutes(fData.hora_ini);
              const finMin = timeToMinutes(value);

              if (iniMin !== null && finMin !== null) {
                if (finMin <= iniMin) {
                  errores.push('Debe ser mayor que la hora de inicio');
                  errors.hora_ini = 'Debe ser menor que la hora de fin';
                } else {
                  delete errors.hora_ini;

                  // Validación 6: Duración válida (40-60 minutos)
                  const duracion = duracionMinutos(fData.hora_ini, value);
                  if (duracion > 0 && !DURACIONES_VALIDAS.includes(duracion)) {
                    errors.duracion = `Duración inválida (${duracion} min). Debe ser 40, 45, 50, 55 o 60 minutos`;
                  } else if (duracion > 0) {
                    delete errors.duracion;
                  }
                }
              }
            }
          }
        }

        if (errores.length > 0) {
          errors.hora_fin = errores.join('. ');
        } else {
          delete errors.hora_fin;
        }
        break;
      }

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

  const duracionLabel = () => {
    if (!formData.hora_ini || !formData.hora_fin) return '—';
    const mins = duracionMinutos(formData.hora_ini, formData.hora_fin);
    if (mins <= 0) return 'Rango inválido';
    if (!DURACIONES_VALIDAS.includes(mins)) return `${mins} min (fuera de rango)`;
    return `${mins} minutos`;
  };

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
          <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            {isEditing ? 'Editar Horario' : 'Crear Nuevo Horario'}
          </h2>
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
          <p className="text-sm text-gray-600 mb-4">
            Define bloques de horario que luego se asignarán a las aulas.
          </p>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Día de la semana */}
            <div>
              <label htmlFor="dia_sem" className="block text-sm font-semibold text-gray-700 mb-2">
                Día de la semana <span className="text-red-500">*</span>
              </label>
              <select
                id="dia_sem"
                name="dia_sem"
                value={formData.dia_sem ?? 'LU'}
                onChange={handleFieldChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.dia_sem
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                  }`}
              >
                <option value="" disabled>
                  Selecciona un día
                </option>
                {DIAS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {fieldErrors.dia_sem && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.dia_sem}
                </p>
              )}
            </div>


            <div></div>

            {/* Hora de inicio */}
            <div>
              <label htmlFor="hora_ini" className="block text-sm font-semibold text-gray-700 mb-2">
                Hora de inicio <span className="text-red-500">*</span>
              </label>
              <HoraSelect
                id="hora_ini"
                name="hora_ini"
                value={formData.hora_ini ?? ''}
                onChange={handleFieldChange}
                error={!!fieldErrors.hora_ini}
              />
              {fieldErrors.hora_ini && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.hora_ini}
                </p>
              )}
            </div>

            {/* Hora de fin */}
            <div>
              <label htmlFor="hora_fin" className="block text-sm font-semibold text-gray-700 mb-2">
                Hora de fin <span className="text-red-500">*</span>
              </label>
              <HoraSelect
                id="hora_fin"
                name="hora_fin"
                value={formData.hora_fin ?? ''}
                onChange={handleFieldChange}
                error={!!fieldErrors.hora_fin}
              />
              {fieldErrors.hora_fin && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.hora_fin}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="duracion" className="block text-sm font-semibold text-gray-700 mb-2">
                Duración estimada
              </label>
              <input
                id="duracion"
                type="text"
                disabled
                value={duracionLabel()}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
              />
              {fieldErrors.duracion && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.duracion}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                ✓ Duraciones válidas: 40, 45, 50, 55 o 60 minutos
              </p>
            </div>
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
                  <li>Las horas se seleccionan en incrementos de 5 minutos</li>
                  <li>La hora de fin debe ser mayor que la de inicio</li>
                  <li>Duraciones válidas: 40, 45, 50, 55 o 60 minutos exactamente</li>
                  <li>Ejemplo: 07:00 a 07:50 (50 min) ✓ | 07:30 a 08:10 (40 min) ✓</li>
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
              disabled={isSubmitting || Object.keys(fieldErrors).length > 0}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  {isEditing ? 'Guardar Cambios' : 'Crear Horario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HorariosForm;
