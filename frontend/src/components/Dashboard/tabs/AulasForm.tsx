import React, { useState } from 'react';
import { X, AlertCircle, BookOpen, Zap } from 'lucide-react';
import type { Aula } from '../../../types/aula';
import type { Institucion } from '../../../types/institucion';
import type { Sede } from '../../../types/sede';

import { aulasService } from '../../../services/api/aulas.service';
import type { CreateAulaDto, UpdateAulaDto } from '../../../types/aula';

export type InstitucionIdFilter = number | 'all';

interface AulasFormProps {
  isEditing: boolean;
  formData: Partial<Aula>;
  instituciones: Institucion[];
  sedesFiltradas: Sede[];
  selectedInstitucionId: InstitucionIdFilter;
  // Removed unused props
  onClose: () => void;
}

const GRADOS_PERMITIDOS = [4, 5, 9, 10];
// const GRUPOS_VALIDOS = /^[A-Z]$/; // No longer used as grupo is number

interface FieldErrors {
  institucion?: string;
  sede?: string;
  grado?: string;
  grupo?: string;
}

const getProgramaFromGrado = (grado?: number) => {
  if (!grado) return '-';
  return grado === 4 || grado === 5 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM';
};

const AulasForm: React.FC<AulasFormProps> = ({
  isEditing,
  formData: initialFormData,
  instituciones,
  sedesFiltradas,
  selectedInstitucionId: initialInstitucionId,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<Aula>>(initialFormData);
  const [selectedInstitucionId, setSelectedInstitucionId] = useState<InstitucionIdFilter>(initialInstitucionId);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Validar campos individuales
  const validateField = (name: string, value: any) => {
    const errors: FieldErrors = { ...fieldErrors };

    switch (name) {
      case 'institucion':
        if (selectedInstitucionId === 'all') {
          errors.institucion = 'Debes seleccionar una institución';
        } else {
          delete errors.institucion;
        }
        break;
      case 'id_sede':
        if (!value || value === '0') {
          errors.sede = 'Debes seleccionar una sede';
        } else {
          delete errors.sede;
        }
        break;
      case 'grado':
        if (!GRADOS_PERMITIDOS.includes(Number(value))) {
          errors.grado = 'El grado debe ser 4, 5, 9 o 10';
        } else {
          delete errors.grado;
        }
        break;
      case 'grupo':
        if (!value || value === '') {
          errors.grupo = 'El grupo es obligatorio';
        } else if (isNaN(Number(value)) || Number(value) < 1) {
          errors.grupo = 'El grupo debe ser un número positivo';
        } else {
          delete errors.grupo;
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'grupo' || name === 'grado' || name === 'id_sede' ? Number(value) : value
    }));

    validateField(name, value);
  };

  const handleInstitucionChange = (value: InstitucionIdFilter) => {
    setSelectedInstitucionId(value);
    validateField('institucion', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: FieldErrors = {};
    if (selectedInstitucionId === 'all') errors.institucion = 'Debes seleccionar una institución';
    if (!formData.id_sede) errors.sede = 'Debes seleccionar una sede';
    if (!formData.grupo) errors.grupo = 'El grupo es obligatorio';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (isEditing && formData.id) {
        const updateData: UpdateAulaDto = {
          grado: formData.grado as 4 | 5 | 9 | 10,
          grupo: Number(formData.grupo),
          id_sede: Number(formData.id_sede)
        };
        await aulasService.update(formData.id, updateData);
      } else {
        const createData: CreateAulaDto = {
          grado: formData.grado as 4 | 5 | 9 | 10,
          grupo: Number(formData.grupo),
          id_sede: Number(formData.id_sede!)
        };
        await aulasService.create(createData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving aula:', error);
      // API client handles toast, but we can show form error if needed
      if (error.response?.data?.message) {
        setFormError(Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
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
            <BookOpen className="w-6 h-6" />
            {isEditing ? 'Editar Aula' : 'Registrar Nueva Aula'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Institución */}
          <div>
            <label htmlFor="institucion" className="block text-sm font-semibold text-gray-700 mb-2">
              Institución <span className="text-red-500">*</span>
            </label>
            <select
              id="institucion"
              value={
                selectedInstitucionId === 'all' ? 'all' : selectedInstitucionId
              }
              onChange={(e) => {
                const value = e.target.value;
                const newValue: InstitucionIdFilter = value === 'all' ? 'all' : Number(value);
                handleInstitucionChange(newValue);
              }}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.institucion
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              required
            >
              <option value="all" disabled>
                Selecciona una institución
              </option>
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.institucion && (
              <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.institucion}
              </p>
            )}
          </div>

          {/* Sede */}
          <div>
            <label htmlFor="id_sede" className="block text-sm font-semibold text-gray-700 mb-2">
              Sede <span className="text-red-500">*</span>
            </label>
            <select
              id="id_sede"
              name="id_sede"
              value={formData.id_sede ?? 0}
              onChange={handleFieldChange}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.sede
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              required
            >
              <option value={0} disabled>
                Selecciona una sede
              </option>
              {sedesFiltradas.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.sede && (
              <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.sede}
              </p>
            )}
          </div>

          {/* Grado */}
          <div>
            <label htmlFor="grado" className="block text-sm font-semibold text-gray-700 mb-2">
              Grado <span className="text-red-500">*</span>
            </label>
            <select
              id="grado"
              name="grado"
              value={formData.grado ?? 4}
              onChange={handleFieldChange}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.grado
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              required
            >
              {GRADOS_PERMITIDOS.map((g) => (
                <option key={g} value={g}>
                  Grado {g}
                </option>
              ))}
            </select>
            {fieldErrors.grado && (
              <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.grado}
              </p>
            )}
          </div>

          {/* Grupo */}
          <div>
            <label htmlFor="grupo" className="block text-sm font-semibold text-gray-700 mb-2">
              Grupo <span className="text-red-500">*</span>
            </label>
            <input
              id="grupo"
              name="grupo"
              type="number"
              min="1"
              value={formData.grupo ?? ''}
              onChange={handleFieldChange}
              placeholder="Ej: 1, 2, 3..."
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.grupo
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
              required
            />
            {fieldErrors.grupo && (
              <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.grupo}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Ingresa el número del grupo</p>
          </div>

          {/* Programa (solo lectura) */}
          <div>
            <label htmlFor="programa" className="block text-sm font-semibold text-gray-700 mb-2">
              Programa Educativo
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-lg">
              <Zap className="w-5 h-5 text-gray-400" />
              <input
                id="programa"
                type="text"
                disabled
                value={getProgramaFromGrado(formData.grado)}
                className="flex-1 bg-transparent focus:outline-none text-gray-700 font-medium"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.grado === 4 || formData.grado === 5
                ? '📚 Se determinará automáticamente para grados 4-5 (Inside Classroom)'
                : '🌍 Se determinará automáticamente para grados 9-10 (Outside Classroom)'}
            </p>
          </div>

          {/* Error general */}
          {formError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideInDown">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{formError}</p>
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex gap-2">
              <span className="text-blue-600 text-lg flex-shrink-0">💡</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Información sobre Aulas:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Grados:</strong> 4-5 (Inside Classroom) o 9-10 (Outside Classroom)</li>
                  <li><strong>Grupo:</strong> Número que identifica la sección</li>
                  <li><strong>Sede:</strong> Ubicación física donde se dictan las clases</li>
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
                  <BookOpen className="w-4 h-4" />
                  {isEditing ? 'Actualizar Aula' : 'Crear Aula'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AulasForm;