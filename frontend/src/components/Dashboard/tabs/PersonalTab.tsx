import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import type { Personal } from '../../../types/personal';
import type { Rol } from '../../../types/rol';
import type { TipoDocumento } from '../../../types/tipoDocumento';
import PersonalForm from './PersonalForm';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { personalService, rolesService, tipoDocumentoService } from '../../../services/api';

export function PersonalTab() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPersonal, setSelectedPersonal] = useState<Personal | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<number | ''>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, tiposDocData, personalData] = await Promise.all([
        rolesService.getAll(),
        tipoDocumentoService.getAll(),
        personalService.getAll(),
      ]);

      setRoles(rolesData);
      setTiposDoc(tiposDocData);
      setPersonal(personalData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPersonal(null);
    setShowForm(true);
  };

  const handleEdit = (p: Personal) => {
    setSelectedPersonal(p);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este personal?')) {
      try {
        await personalService.delete(id);
        setPersonal(personal.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar personal:', error);
      }
    }
  };

  const handleFormSubmit = async (formData: Partial<Personal>) => {
    try {
      if (selectedPersonal) {
        // Update existing personal
        const { id, ...updateData } = formData;
        await personalService.update(selectedPersonal.id, updateData);
      } else {
        // Create new personal
        const { id, ...createData } = formData as any;
        await personalService.create(createData);
      }
      handleFormClose();
    } catch (error: any) {
      console.error('Error al guardar personal:', error);
      // Error is handled by api-client interceptor
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPersonal(null);
    fetchData();
  };

  const filteredPersonal = personal.filter(p => {
    const rol = roles.find(r => r.id === p.id_rol);

    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rol?.nombre.toLowerCase() ?? '').includes(searchTerm.toLowerCase());

    const matchesFilter = filterRol === '' || p.id_rol === filterRol;

    return matchesSearch && matchesFilter;
  });

  const getTipoDocSigla = (tipo_doc: number) => {
    return tiposDoc.find(td => td.id === tipo_doc)?.sigla ?? 'N/A';
  };

  const getRolName = (id_rol: number) => {
    return roles.find(r => r.id === id_rol)?.nombre ?? 'Desconocido';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              Personal
            </CardTitle>
            <CardDescription>
              Gestión de administrativos y tutores del programa
            </CardDescription>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Agregar Personal
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Cargando personal...
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
                  placeholder="Buscar por nombre, correo o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                />
              </div>

              <select
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
              >
                <option value="">Todos los roles</option>
                {roles.map(rol => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
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
                      Nombre Completo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPersonal.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500 italic">
                        {searchTerm || filterRol !== ''
                          ? 'No se encontró personal con ese criterio de búsqueda'
                          : 'No hay personal registrado. Haz clic en "Agregar Personal" para comenzar.'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredPersonal.map((p) => (
                      <tr key={p.id} className="hover:bg-green-50 transition-colors border-b border-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {p.id}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {p.nombre} {p.apellido || ''}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getTipoDocSigla(p.tipo_doc)} - {p.codigo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {p.correo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {p.telefono || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${p.id_rol === 1
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {getRolName(p.id_rol)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
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
        <PersonalForm
          isEditing={selectedPersonal !== null}
          formData={selectedPersonal ?? {}}
          roles={roles}
          tiposDoc={tiposDoc}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </Card>
  );
}
