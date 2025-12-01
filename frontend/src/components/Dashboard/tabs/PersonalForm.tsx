import React, { useState } from 'react';
import { X, AlertCircle, Users } from 'lucide-react';
import type { Personal } from '../../../types/personal';
import type { Rol } from '../../../types/rol';
import type { TipoDocumento } from '../../../types/tipoDocumento';

interface PersonalFormProps {
  isEditing: boolean;
  formData: Partial<Personal>;
  roles: Rol[];
  tiposDoc: TipoDocumento[];
  onClose: () => void;
  onSubmit: (formData: Partial<Personal>) => Promise<void>;
}

interface FieldErrors {
  nombre?: string;
  apellido?: string;
  tipo_doc?: string;
  codigo?: string;
  correo?: string;
  telefono?: string;
  id_rol?: string;
}

const TELEFONO_PATTERN = /^[0-9\s\-\+()]+$/;
const TELEFONO_MIN_DIGITS = 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENTO_PATTERN = /^[0-9]+$/;

const PersonalForm: React.FC<PersonalFormProps> = ({
  isEditing,
  formData: initialFormData,
  roles,
  tiposDoc,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<Personal>>(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar campos individuales
  const validateField = (name: string, value: any) => {
    const errors: FieldErrors = { ...fieldErrors };

    switch (name) {
      case 'nombre':
        if (!value || value.trim() === '') {
          errors.nombre = 'El nombre es obligatorio';
        } else if (value.trim().length < 2) {
          errors.nombre = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete errors.nombre;
        }
        break;
      case 'apellido':
        // Apellido is optional
        if (value && value.trim().length > 0 && value.trim().length < 2) {
          errors.apellido = 'El apellido debe tener al menos 2 caracteres';
        } else {
          delete errors.apellido;
        }
        break;
      case 'tipo_doc':
        if (!value || value === '0') {
          errors.tipo_doc = 'Debes seleccionar un tipo de documento';
        } else {
          delete errors.tipo_doc;
        }
        break;
      case 'codigo':
        if (!value || value.trim() === '') {
          errors.codigo = 'El código es obligatorio';
        } else if (value.trim().length < 3) {
          errors.codigo = 'El código debe tener al menos 3 caracteres';
        } else {
          delete errors.codigo;
        }
        break;
      case 'correo':
        if (!value || value.trim() === '') {
          errors.correo = 'El correo es obligatorio';
        } else if (!EMAIL_PATTERN.test(value.trim())) {
          errors.correo = 'El correo no es válido (ej: usuario@dominio.com)';
        } else {
          delete errors.correo;
        }
        break;
      case 'telefono':
        if (value && value.trim() !== '') {
          if (!TELEFONO_PATTERN.test(value.trim())) {
            errors.telefono = 'El teléfono contiene caracteres inválidos';
          } else {
            const digits = value.replace(/\D/g, '');
            if (digits.length < TELEFONO_MIN_DIGITS) {
              errors.telefono = `El teléfono debe tener al menos ${TELEFONO_MIN_DIGITS} dígitos`;
            } else {
              delete errors.telefono;
            }
          }
        } else {
          delete errors.telefono;
        }
        break;
      case 'id_rol':
        if (!value || value === '0') {
          errors.id_rol = 'Debes seleccionar un rol';
        } else {
          delete errors.id_rol;
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
      [name]: name === 'tipo_doc' || name === 'id_rol' ? Number(value) : value,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const errors: string[] = [];
    if (!formData.nombre || formData.nombre.trim() === '') errors.push('nombre');
    if (!formData.tipo_doc || formData.tipo_doc === 0) errors.push('tipo_doc');
    if (!formData.codigo || formData.codigo.trim() === '') errors.push('codigo');
    if (!formData.correo || formData.correo.trim() === '') errors.push('correo');
    if (!formData.id_rol || formData.id_rol === 0) errors.push('id_rol');

    if (errors.length > 0) {
      setFormError('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setFormError(error.message || 'Error al guardar el personal');
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
            <Users className="w-6 h-6" />
            {isEditing ? 'Editar Personal' : 'Registrar Nuevo Personal'}
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
          <p className="text-sm text-gray-600 mb-4">
            Registra administrativos y tutores del programa Global English.
          </p>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: Juan"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.nombre
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                  }`}
              />
              {fieldErrors.nombre && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.nombre}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={formData.apellido ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: Pérez Torres"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.apellido
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                  }`}
              />
              {fieldErrors.apellido && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.apellido}
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
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.tipo_doc
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

            {/* Código */}
            <div>
              <label htmlFor="codigo" className="block text-sm font-semibold text-gray-700 mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                value={formData.codigo ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: 1048123123"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.codigo
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                  }`}
              />
              {fieldErrors.codigo && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.codigo}
                </p>
              )}
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo ?? ''}
                onChange={handleFieldChange}
                placeholder="correo@ejemplo.com"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.correo
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                  }`}
              />
              {fieldErrors.correo && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.correo}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono ?? ''}
                onChange={handleFieldChange}
                placeholder="Ej: 3001234567"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.telefono
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                  }`}
              />
              {fieldErrors.telefono && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.telefono}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Opcional. Mín. 7 dígitos si se proporciona</p>
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="id_rol" className="block text-sm font-semibold text-gray-700 mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                id="id_rol"
                name="id_rol"
                value={formData.id_rol ?? 0}
                onChange={handleFieldChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${fieldErrors.id_rol
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                  }`}
              >
                <option value={0} disabled>
                  Selecciona un rol
                </option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                    {rol.descripcion && ` - ${rol.descripcion}`}
                  </option>
                ))}
              </select>
              {fieldErrors.id_rol && (
                <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.id_rol}
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
                  <li>El correo debe ser válido (usuario@dominio.com)</li>
                  <li>El código debe tener al menos 3 caracteres</li>
                  <li>El teléfono es opcional pero debe tener mín. 7 dígitos</li>
                  <li>El apellido es opcional</li>
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
                  <Users className="w-4 h-4" />
                  {isEditing ? 'Actualizar Personal' : 'Registrar Personal'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalForm;
