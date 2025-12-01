import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import type { Aula } from '../../../types/aula';
import type { Institucion } from '../../../types/institucion';
import type { Sede } from '../../../types/sede';
import AulasForm, { type InstitucionIdFilter } from './AulasForm';
import { Search, Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { aulasService } from '../../../services/api/aulas.service';
import { sedesService } from '../../../services/api/sedes.service';
import { institucionesService } from '../../../services/api/instituciones.service';

type SedeIdFilter = number | 'all';

const getProgramaFromGrado = (grado: number) =>
  grado === 4 || grado === 5 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM';

export function AulasTab() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState<InstitucionIdFilter>('all');
  const [filterSede, setFilterSede] = useState<SedeIdFilter>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [institucionesData, sedesData, aulasData] = await Promise.all([
        institucionesService.getAll(),
        sedesService.getAll(),
        aulasService.getAll()
      ]);

      setInstituciones(institucionesData);
      setSedes(sedesData);
      setAulas(aulasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Error toast is handled automatically by API client
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAula(null);
    setShowForm(true);
  };

  const handleEdit = (aula: Aula) => {
    setSelectedAula(aula);
    setShowForm(true);

    const sede = sedes.find(s => s.id === aula.id_sede);
    if (sede) {
      setFilterInstitucion(sede.id_inst);
      setFilterSede(sede.id);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta aula?')) {
      try {
        await aulasService.delete(id);
        // Success toast is shown automatically by API client
        fetchData();
      } catch (error) {
        console.error('Error al eliminar aula:', error);
        // Error toast is shown automatically by API client
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedAula(null);
    fetchData();
  };

  const sedesFiltradasPorInstitucion = filterInstitucion === 'all'
    ? sedes
    : sedes.filter(s => s.id_inst === filterInstitucion);

  const filteredAulas = aulas.filter(aula => {
    const sede = sedes.find(s => s.id === aula.id_sede);
    const institucion = instituciones.find(i => i.id === sede?.id_inst);

    const matchesInst = filterInstitucion === 'all' || institucion?.id === filterInstitucion;
    const matchesSede = filterSede === 'all' || sede?.id === filterSede;

    const termino = searchTerm.toLowerCase().trim();
    const matchesSearch =
      termino === '' ||
      aula.grupo.toString().includes(termino) ||
      (sede?.nombre || '').toLowerCase().includes(termino) ||
      (institucion?.nombre || '').toLowerCase().includes(termino) ||
      aula.grado.toString().includes(termino);

    return matchesInst && matchesSede && matchesSearch;
  });

  const getNombreSede = (id_sede: number) => {
    return sedes.find(s => s.id === id_sede)?.nombre ?? 'N/A';
  };

  const getNombreInstitucion = (id_sede: number) => {
    const sede = sedes.find(s => s.id === id_sede);
    return instituciones.find(i => i.id === sede?.id_inst)?.nombre ?? 'N/A';
  };

  const getPrograma = (grado: number) => {
    return getProgramaFromGrado(grado);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-600" />
              Aulas
            </CardTitle>
            <CardDescription>
              Gestión de aulas, grados y asignación de sedes
            </CardDescription>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Crear Aula
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Cargando aulas...
            </div>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por institución, sede, grupo o grado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Institución
                  </label>
                  <select
                    value={filterInstitucion === 'all' ? 'all' : filterInstitucion}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterInstitucion(value === 'all' ? 'all' : Number(value));
                      setFilterSede('all');
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
                  >
                    <option value="all">Todas las instituciones</option>
                    {instituciones.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sede
                  </label>
                  <select
                    value={filterSede === 'all' ? 'all' : filterSede}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterSede(value === 'all' ? 'all' : Number(value));
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
                  >
                    <option value="all">Todas las sedes</option>
                    {sedesFiltradasPorInstitucion.map(sede => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
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
                      Institución
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Sede
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Programa
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAulas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500 italic">
                        {searchTerm || filterInstitucion !== 'all' || filterSede !== 'all'
                          ? 'No se encontraron aulas con ese criterio de búsqueda'
                          : 'No hay aulas registradas. Haz clic en "Crear Aula" para comenzar.'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredAulas.map((aula) => (
                      <tr key={aula.id} className="hover:bg-green-50 transition-colors border-b border-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {aula.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getNombreInstitucion(aula.id_sede)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getNombreSede(aula.id_sede)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            Grado {aula.grado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Grupo {aula.grupo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPrograma(aula.grado) === 'INSIDECLASSROOM'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-indigo-100 text-indigo-800'
                            }`}>
                            {getPrograma(aula.grado) === 'INSIDECLASSROOM' ? 'Inside' : 'Outside'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(aula)}
                              className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(aula.id)}
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
        <AulasForm
          isEditing={selectedAula !== null}
          formData={selectedAula ?? { grado: 4, grupo: '', id_sede: 0 }}
          instituciones={instituciones}
          sedesFiltradas={sedesFiltradasPorInstitucion}
          selectedInstitucionId={filterInstitucion}
          formError={null}
          isSubmitting={false}
          onClose={handleFormClose}
        // Removed props that are no longer needed as AulasForm handles submission internally
        />
      )}
    </Card>
  );
}
