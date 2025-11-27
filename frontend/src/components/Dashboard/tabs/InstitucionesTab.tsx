import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import type { Institucion } from '../../../types/institucion';
import { jornadaStringToArray } from '../../../types/institucion';
import InstitucionForm from './InstitucionesForm';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';

export function InstitucionesTab() {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedInstitucion, setSelectedInstitucion] = useState<Institucion | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInstituciones();
  }, []);

  const fetchInstituciones = async () => {
    setLoading(true);
    try {
      // Datos de prueba
      const mockData: Institucion[] = [
        {
          id: 1,
          nombre: 'IED Simón Bolívar',
          correo: 'contacto@simonbolivar.edu.co',
          jornada: 'MANANA_Y_TARDE',
          nombre_contacto: 'María González',
          telefono_contacto: '3001234567'
        },
        {
          id: 2,
          nombre: 'IED José Martí',
          correo: 'info@josemarti.edu.co',
          jornada: 'UNICA_MANANA',
          nombre_contacto: 'Carlos Pérez',
          telefono_contacto: '3009876543'
        }
      ];
      
      setInstituciones(mockData);
    } catch (error) {
      console.error('Error al cargar instituciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInstitucion(null);
    setShowForm(true);
  };

  const handleEdit = (institucion: Institucion) => {
    setSelectedInstitucion(institucion);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta institución?')) {
      try {
        // Llamar a la API
        setInstituciones(instituciones.filter(inst => inst.id !== id));
        alert('Institución eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar institución:', error);
        alert('Error al eliminar la institución');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedInstitucion(null);
    fetchInstituciones();
  };

  const getJornadaText = (jornadaStr: string) => {
    const jornadas = jornadaStringToArray(jornadaStr);
    return jornadas.map(j => {
      switch(j) {
        case 'UNICA_MANANA': return 'Única Mañana';
        case 'UNICA_TARDE': return 'Única Tarde';
        case 'MANANA_Y_TARDE': return 'Mañana y Tarde';
        default: return j;
      }
    }).join(', ');
  };

  const filteredInstituciones = instituciones.filter(inst =>
    inst.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle>Instituciones Educativas del Distrito (IED)</CardTitle>
            <CardDescription>
              Gestión de las instituciones invitadas al programa GlobalEnglish
            </CardDescription>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Invitar Institución
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p>Cargando instituciones...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Nombre Institución
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Jornada(s)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInstituciones.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500 italic">
                        {searchTerm 
                          ? 'No se encontraron instituciones con ese criterio de búsqueda'
                          : 'No hay instituciones registradas. Haz clic en "Invitar Institución" para comenzar.'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredInstituciones.map((institucion) => (
                      <tr key={institucion.id} className="hover:bg-green-50 transition-colors border-b border-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {institucion.id}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {institucion.nombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {institucion.correo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getJornadaText(institucion.jornada)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {institucion.nombre_contacto}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {institucion.telefono_contacto}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => {/* TODO: Vista detalle */}}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(institucion)}
                              className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(institucion.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>

      {showForm && (
        <InstitucionForm
          institucion={selectedInstitucion}
          onClose={handleFormClose}
        />
      )}
    </Card>
  );
}
