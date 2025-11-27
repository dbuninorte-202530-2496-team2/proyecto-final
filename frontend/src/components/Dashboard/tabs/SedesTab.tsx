import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import type { SedeConInstitucion } from '../../../types/sede';
import type { Institucion } from '../../../types/institucion';
import SedeForm from './SedeForm';
import { Search, Plus, Edit2, Trash2, Eye, Building2, MapPin, Star } from 'lucide-react';

export function SedesTab() {
  const [sedes, setSedes] = useState<SedeConInstitucion[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSede, setSelectedSede] = useState<SedeConInstitucion | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState<number | ''>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
  
      // Datos de ejemplo de instituciones
      const mockInstituciones: Institucion[] = [
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

      // Datos de ejemplo de sedes
      const mockSedes: SedeConInstitucion[] = [
        {
          id: 1,
          nombre: 'Sede Principal',
          direccion: 'Calle 50 #20-30, Barranquilla',
          id_inst: 1,
          is_principal: true,
          nombreInstitucion: 'IED Simón Bolívar'
        },
        {
          id: 2,
          nombre: 'Sede Norte',
          direccion: 'Carrera 45 #80-15, Barranquilla',
          id_inst: 1,
          is_principal: false,
          nombreInstitucion: 'IED Simón Bolívar'
        },
        {
          id: 3,
          nombre: 'Sede Principal',
          direccion: 'Carrera 38 #70-25, Barranquilla',
          id_inst: 2,
          is_principal: true,
          nombreInstitucion: 'IED José Martí'
        }
      ];
      
      setInstituciones(mockInstituciones);
      setSedes(mockSedes);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSede(null);
    setShowForm(true);
  };

  const handleEdit = (sede: SedeConInstitucion) => {
    setSelectedSede(sede);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const sede = sedes.find(s => s.id === id);
    if (sede?.is_principal) {
      alert('No se puede eliminar la sede principal. Primero debe designar otra sede como principal.');
      return;
    }

    if (window.confirm('¿Está seguro de eliminar esta sede?')) {
      try {
        // Llamar a la API
        setSedes(sedes.filter(s => s.id !== id));
        alert('Sede eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar sede:', error);
        alert('Error al eliminar la sede');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedSede(null);
    fetchData();
  };

  const filteredSedes = sedes.filter(sede => {
    const matchesSearch = 
      sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sede.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sede.nombreInstitucion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterInstitucion === '' || sede.id_inst === filterInstitucion;
    
    return matchesSearch && matchesFilter;
  });

  const totalSedes = sedes.length;
  const sedesPrincipales = sedes.filter(s => s.is_principal).length;
  const sedesSecundarias = sedes.filter(s => !s.is_principal).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-green-600" />
              Sedes de las Instituciones
            </CardTitle>
            <CardDescription>
              Gestión de sedes principales y secundarias de cada institución
            </CardDescription>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Agregar Sede
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Cargando sedes...
            </div>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, dirección o institución..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                />
              </div>
              
              <select
                value={filterInstitucion}
                onChange={(e) => setFilterInstitucion(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
              >
                <option value="">Todas las instituciones</option>
                {instituciones.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Nombre Sede
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Institución
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSedes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500 italic">
                        {searchTerm || filterInstitucion !== '' 
                          ? 'No se encontraron sedes con ese criterio de búsqueda'
                          : 'No hay sedes registradas. Haz clic en "Agregar Sede" para comenzar.'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredSedes.map((sede) => (
                      <tr key={sede.id} className={`transition-all duration-200 border-b border-gray-100 ${
                        sede.is_principal 
                          ? 'bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 hover:to-blue-50' 
                          : 'hover:bg-green-50'
                      }`}>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            {sede.id}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-semibold">{sede.nombre}</p>
                              {sede.is_principal && <p className="text-xs text-blue-600 font-bold">⭐ Sede Principal</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{sede.direccion}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                            🏫 {sede.nombreInstitucion}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {sede.is_principal ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold shadow-sm">
                              <Star className="w-3 h-3 fill-current" />
                              Principal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                              📌 Secundaria
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {/* TODO: Vista detalle */}}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-600 hover:text-blue-700 font-semibold transform hover:scale-110 duration-150"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(sede)}
                              className="p-2 hover:bg-amber-100 rounded-lg transition-all text-amber-600 hover:text-amber-700 font-semibold transform hover:scale-110 duration-150"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sede.id)}
                              disabled={sede.is_principal}
                              className={`p-2 rounded-lg transition-all font-semibold transform duration-150 ${
                                sede.is_principal
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'hover:bg-red-100 text-red-600 hover:text-red-700 hover:scale-110'
                              }`}
                              title={sede.is_principal ? 'No se puede eliminar la sede principal' : 'Eliminar'}
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

            {/* Resumen estadístico */}
            {filteredSedes.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Total de Sedes</p>
                      <p className="text-2xl font-bold text-blue-900">{totalSedes}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-700 fill-current" />
                    </div>
                    <div>
                      <p className="text-sm text-yellow-600 font-semibold">Sedes Principales</p>
                      <p className="text-2xl font-bold text-yellow-900">{sedesPrincipales}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-semibold">Sedes Secundarias</p>
                      <p className="text-2xl font-bold text-purple-900">{sedesSecundarias}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {showForm && (
        <SedeForm
          sede={selectedSede}
          instituciones={instituciones}
          onClose={handleFormClose}
        />
      )}
    </Card>
  );
}
