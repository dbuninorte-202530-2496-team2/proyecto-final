import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import type { Estudiante } from '../../../types/estudiante';
import type { TipoDocumento } from '../../../types/tipoDocumento';
import type { Aula } from '../../../types/aula';

interface EstudiantesFormProps {
  isEditing: boolean;
  formData: Partial<Estudiante>;

  tiposDoc: TipoDocumento[];
  aulas: Aula[];

  formError: string | null;
  isSubmitting: boolean;

  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

interface FieldErrors {
  nombres?: string;
  apellidos?: string;
  tipo_doc?: string;
  num_doc?: string;
  id_aula?: string;
  score_in?: string;
  score_out?: string;
}

const EstudiantesForm: React.FC<EstudiantesFormProps> = ({
  isEditing,
  formData,
  tiposDoc,
  aulas,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}) => {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateField = (name: string, value: any) => {
    const errors: FieldErrors = { ...fieldErrors };

    switch (name) {
      case 'nombres':
        if (!value || value.trim() === '') {
          errors.nombres = 'Los nombres son obligatorios';
        } else if (value.trim().length < 3) {
          errors.nombres = 'Debe tener al menos 3 caracteres';
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
          errors.nombres = 'Solo se permiten letras y espacios';
        } else {
          delete errors.nombres;
        }
        break;

      case 'apellidos':
        if (!value || value.trim() === '') {
          errors.apellidos = 'Los apellidos son obligatorios';
        } else if (value.trim().length < 3) {
          errors.apellidos = 'Debe tener al menos 3 caracteres';
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
          errors.apellidos = 'Solo se permiten letras y espacios';
        } else {
          delete errors.apellidos;
        }
        break;

      case 'tipo_doc':
        if (!value || value === 0 || value === '') {
          errors.tipo_doc = 'Debes seleccionar un tipo de documento';
        } else {
          delete errors.tipo_doc;
        }
        break;

      case 'num_doc':
        if (!value || value.trim() === '') {
          errors.num_doc = 'El número de documento es obligatorio';
        } else if (!/^\d{6,20}$/.test(value.trim())) {
          errors.num_doc = 'Debe ser numérico (6-20 dígitos)';
        } else {
          delete errors.num_doc;
        }
        break;

      case 'id_aula':
        if (!value || value === 0 || value === '') {
          errors.id_aula = 'Debes seleccionar un aula';
        } else {
          delete errors.id_aula;
        }
        break;

      case 'score_in':
        if (value !== '' && value !== undefined) {
          const num = Number(value);
          if (isNaN(num) || num < 0 || num > 100) {
            errors.score_in = 'Debe ser un número entre 0 y 100';
          } else {
            delete errors.score_in;
          }
        } else {
          delete errors.score_in;
        }
        break;

      case 'score_out':
        if (value !== '' && value !== undefined) {
          const num = Number(value);
          if (isNaN(num) || num < 0 || num > 100) {
            errors.score_out = 'Debe ser un número entre 0 y 100';
          } else {
            delete errors.score_out;
          }
        } else {
          delete errors.score_out;
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
          <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
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
            Registra estudiantes y asígnalos a un aula del programa.
          </p>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombres */}
            <div>
              <label htmlFor="nombres" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                id="nombres"
                name="nombres"
                value={formData.nombres ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: Donald José"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.nombres
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              />
              {fieldErrors.nombres && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.nombres}
                </p>
              )}
              {formData.nombres && !fieldErrors.nombres && (
                <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Válido
                </p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellidos" className="block text-sm font-semibold text-gray-700 mb-2">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                id="apellidos"
                name="apellidos"
                value={formData.apellidos ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: Pimienta Pérez"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.apellidos
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              />
              {fieldErrors.apellidos && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.apellidos}
                </p>
              )}
              {formData.apellidos && !fieldErrors.apellidos && (
                <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Válido
                </p>
              )}
            </div>

            {/* Tipo de documento */}
            <div>
              <label htmlFor="tipo_doc" className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de documento <span className="text-red-500">*</span>
              </label>
              <select
                id="tipo_doc"
                name="tipo_doc"
                value={formData.tipo_doc ?? 0}
                onChange={handleFieldChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.tipo_doc
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              >
                <option value={0} disabled>
                  Selecciona un tipo
                </option>
                {tiposDoc.map((td) => (
                  <option key={td.id} value={td.id}>
                    {td.sigla} - {td.nombre}
                  </option>
                ))}
              </select>
              {fieldErrors.tipo_doc && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.tipo_doc}
                </p>
              )}
            </div>

            {/* Número de documento */}
            <div>
              <label htmlFor="num_doc" className="block text-sm font-semibold text-gray-700 mb-2">
                Número de documento <span className="text-red-500">*</span>
              </label>
              <input
                id="num_doc"
                name="num_doc"
                value={formData.num_doc ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: 200194043"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.num_doc
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              />
              {fieldErrors.num_doc && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.num_doc}
                </p>
              )}
              {formData.num_doc && !fieldErrors.num_doc && (
                <p className="mt-1 text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Válido
                </p>
              )}
            </div>

            {/* Aula */}
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
            </div>

            {/* Score IN */}
            <div>
              <label htmlFor="score_in" className="block text-sm font-semibold text-gray-700 mb-2">
                Score Inicial (Inside Test)
              </label>
              <input
                id="score_in"
                type="number"
                name="score_in"
                min="0"
                max="100"
                value={formData.score_in ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: 78"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.score_in
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              />
              {fieldErrors.score_in && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.score_in}
                </p>
              )}
            </div>

            {/* Score OUT */}
            <div>
              <label htmlFor="score_out" className="block text-sm font-semibold text-gray-700 mb-2">
                Score Final (Outside Test)
              </label>
              <input
                id="score_out"
                type="number"
                name="score_out"
                min="0"
                max="100"
                value={formData.score_out ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: 85"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.score_out
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              />
              {fieldErrors.score_out && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.score_out}
                </p>
              )}
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
                  <li>Los nombres y apellidos deben tener mínimo 3 caracteres</li>
                  <li>El número de documento debe ser numérico (6-20 dígitos)</li>
                  <li>Los scores (0-100) son opcionales y representan pruebas de inglés</li>
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
                'Crear Estudiante'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EstudiantesForm;
