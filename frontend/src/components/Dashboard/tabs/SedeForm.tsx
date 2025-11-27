import { useState, useEffect } from 'react';
import { X, Building2, MapPin, Star } from 'lucide-react';
import type { Sede, SedeFormData } from '../../../types/sede';
import type { Institucion } from '../../../types/institucion';

interface SedeFormProps {
  sede: Sede | null;
  instituciones: Institucion[];
  onClose: () => void;
}

export default function SedeForm({ sede, instituciones, onClose }: SedeFormProps) {
  const [formData, setFormData] = useState<SedeFormData>({
    nombre: '',
    direccion: '',
    id_inst: 0,
    is_principal: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SedeFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sede) {
      setFormData({
        nombre: sede.nombre,
        direccion: sede.direccion,
        id_inst: sede.id_inst,
        is_principal: sede.is_principal
      });
    }
  }, [sede]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'id_inst' ? Number(value) : value 
      }));
    }
    
    if (errors[name as keyof SedeFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SedeFormData, string>> = {};

    // Nombre validation
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la sede es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // Dirección validation
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    } else if (formData.direccion.trim().length < 5) {
      newErrors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }
    
    // Institución validation
    if (!formData.id_inst || formData.id_inst === 0) {
      newErrors.id_inst = 'Debe seleccionar una institución';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {

      console.log('Datos a enviar:', formData);
      alert(`Sede ${sede ? 'actualizada' : 'creada'} exitosamente`);
      onClose();
    } catch (error) {
      console.error('Error al guardar sede:', error);
      alert('Error al guardar la sede');
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
          <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {sede ? 'Editar Sede' : 'Registrar Nueva Sede'}
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
          {/* Seleccionar Institución */}
          <div className="mb-4">
            <label htmlFor="id_inst" className="block text-sm font-semibold text-gray-700 mb-2">
              Institución <span className="text-red-500">*</span>
            </label>
            <select
              id="id_inst"
              name="id_inst"
              value={formData.id_inst}
              onChange={handleInputChange}
              disabled={!!sede} // No permitir cambiar la institución al editar
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                sede
                  ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                  : errors.id_inst 
                    ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
              }`}
              required
            >
              <option value={0}>Seleccione una institución</option>
              {instituciones.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </select>
            {errors.id_inst && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.id_inst}</p>
            )}
            {sede && (
              <p className="mt-1 text-xs text-gray-500">La institución no puede modificarse</p>
            )}
          </div>

          {/* Nombre de la Sede */}
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la Sede <span className="text-red-500">*</span>
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
              placeholder="Ej: Sede Principal, Sede Norte, Sede Sur..."
              required
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.nombre}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="mb-4">
            <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dirección <span className="text-red-500">*</span>
            </label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.direccion 
                  ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-green-300'
              }`}
              placeholder="Ej: Calle 50 #20-30, Barranquilla, Atlántico"
              required
            />
            {errors.direccion && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.direccion}</p>
            )}
          </div>

          {/* Tipo de Sede */}
          <div className="mb-6">
            <label className="flex items-center p-4 hover:bg-green-50 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-green-300 transition-all">
              <input
                type="checkbox"
                name="is_principal"
                checked={formData.is_principal}
                onChange={handleInputChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div className="ml-3 flex items-center gap-2">
                <Star className={`w-5 h-5 ${formData.is_principal ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                <div>
                  <span className="text-sm font-semibold text-gray-900">Marcar como Sede Principal</span>
                  <p className="text-xs text-gray-600">Solo puede haber una sede principal por institución</p>
                </div>
              </div>
            </label>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <span className="text-blue-600 text-lg">💡</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Cada institución debe tener al menos una sede</li>
                  <li>La sede principal no puede ser eliminada</li>
                  <li>Las aulas se asocian a sedes específicas</li>
                </ul>
              </div>
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
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {submitting ? (
                <>Guardando...</>
              ) : (
                <>
                  {sede ? 'Actualizar' : 'Registrar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}