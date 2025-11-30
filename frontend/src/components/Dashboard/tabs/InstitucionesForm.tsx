import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Institucion, InstitucionFormData, Jornada } from '../../../types/institucion';
import { jornadaArrayToString, jornadaStringToArray } from '../../../types/institucion';

// validación de telefono
const TELEFONO_PATTERN = /^[0-9\s\-\+()]+$/;
const TELEFONO_MIN_DIGITS = 7;

interface InstitucionFormProps {
  institucion: Institucion | null;
  onClose: () => void;
}

export default function InstitucionForm({ institucion, onClose }: InstitucionFormProps) {
  const [formData, setFormData] = useState<InstitucionFormData>({
    nombre: '',
    correo: '',
    jornadas: [],
    nombre_contacto: '',
    telefono_contacto: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InstitucionFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (institucion) {
      setFormData({
        nombre: institucion.nombre,
        correo: institucion.correo,
        jornadas: jornadaStringToArray(institucion.jornada),
        nombre_contacto: institucion.nombre_contacto,
        telefono_contacto: institucion.telefono_contacto
      });
    }
  }, [institucion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof InstitucionFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleJornadaChange = (jornada: Jornada) => {
    setFormData(prev => {
      const jornadas = prev.jornadas.includes(jornada)
        ? prev.jornadas.filter(j => j !== jornada)
        : [...prev.jornadas, jornada];
      return { ...prev, jornadas };
    });

    if (errors.jornadas) {
      setErrors(prev => ({ ...prev, jornadas: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InstitucionFormData, string>> = {};

    // validación del nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // validación del email
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido (ej: usuario@dominio.com)';
    }
    
    // validación de las jornadas
    if (formData.jornadas.length === 0) {
      newErrors.jornadas = 'Debe seleccionar al menos una jornada';
    }
    
    // validación del nombre de contacto
    if (!formData.nombre_contacto.trim()) {
      newErrors.nombre_contacto = 'El nombre de contacto es requerido';
    } else if (formData.nombre_contacto.trim().length < 2) {
      newErrors.nombre_contacto = 'El nombre de contacto debe tener al menos 2 caracteres';
    }
    
    // validación del teléfono 
    if (!formData.telefono_contacto.trim()) {
      newErrors.telefono_contacto = 'El teléfono es requerido';
    } else if (!TELEFONO_PATTERN.test(formData.telefono_contacto)) {
      newErrors.telefono_contacto = 'El teléfono contiene caracteres inválidos';
    } else {
      const digits = formData.telefono_contacto.replace(/\D/g, '');
      if (digits.length < TELEFONO_MIN_DIGITS) {
        newErrors.telefono_contacto = `El teléfono debe tener al menos ${TELEFONO_MIN_DIGITS} dígitos`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Convertir jornadas array a string para enviar a la BD
      const dataToSend = {
        nombre: formData.nombre,
        correo: formData.correo,
        jornada: jornadaArrayToString(formData.jornadas),
        nombre_contacto: formData.nombre_contacto,
        telefono_contacto: formData.telefono_contacto
      };

      console.log('Datos a enviar:', dataToSend);
      alert(`Institución ${institucion ? 'actualizada' : 'creada'} exitosamente`);
      onClose();
    } catch (error) {
      console.error('Error al guardar institución:', error);
      alert('Error al guardar la institución');
    } finally {
      setSubmitting(false);
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
          <h2 className="text-xl font-bold text-green-900">
            {institucion ? 'Editar Institución' : 'Registrar Nueva Institución'}
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
        <form onSubmit={handleSubmit} className="p-6">
          {/* Nombre */}
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la Institución <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.nombre 
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
              }`}
              placeholder="Ej: IED Simón Bolívar"
              required
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.nombre}</p>
            )}
          </div>

          {/* Correo */}
          <div className="mb-4">
            <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Institucional <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.correo 
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
              }`}
              placeholder="Ej: contacto@institucion.edu.co"
              required
            />
            {errors.correo && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.correo}</p>
            )}
          </div>

          {/* Jornadas */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Jornada(s) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'UNICA_MANANA' as Jornada, label: 'Única Mañana' },
                { value: 'UNICA_TARDE' as Jornada, label: 'Única Tarde' },
                { value: 'MANANA_Y_TARDE' as Jornada, label: 'Mañana y Tarde' }
              ].map(({ value, label }) => (
                <label key={value} className={`flex items-center p-3 hover:bg-green-50 rounded-lg cursor-pointer border transition-all ${
                  errors.jornadas 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.jornadas.includes(value)}
                    onChange={() => handleJornadaChange(value)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            {errors.jornadas && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.jornadas}</p>
            )}
          </div>

          {/* Nombre y Teléfono de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="nombre_contacto" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre_contacto"
                name="nombre_contacto"
                value={formData.nombre_contacto}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.nombre_contacto 
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
                placeholder="Ej: María González"
                required
              />
              {errors.nombre_contacto && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.nombre_contacto}</p>
              )}
            </div>

            <div>
              <label htmlFor="telefono_contacto" className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono de Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="telefono_contacto"
                name="telefono_contacto"
                value={formData.telefono_contacto}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.telefono_contacto 
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
                }`}
                placeholder="Ej: 3001234567"
                required
              />
              {errors.telefono_contacto && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.telefono_contacto}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? 'Guardando...' : (institucion ? 'Actualizar' : 'Registrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}