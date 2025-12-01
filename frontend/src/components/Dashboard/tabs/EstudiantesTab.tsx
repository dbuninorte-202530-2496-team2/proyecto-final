import React, { useState, useEffect } from 'react';
import type { Estudiante } from '../../../types/estudiante';
import type { TipoDocumento } from '../../../types/tipoDocumento';
import type { Sede } from '../../../types/sede';
import type { Institucion } from '../../../types/institucion';
import type { Aula } from '../../../types/aula';
import { estudiantesService, tipoDocumentoService, aulasService, sedesService, institucionesService } from '../../../services/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';
import { Search, Plus, Users, Edit, Trash2, MoveRight } from 'lucide-react';

const EstudiantesTab: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    apellidos: '',
    tipo_doc: 0,
    score_in: undefined as number | undefined,
    score_out: undefined as number | undefined,
  });

  // Mover aula state
  const [showMoverAula, setShowMoverAula] = useState(false);
  const [estudianteMover, setEstudianteMover] = useState<Estudiante | null>(null);
  const [aulaDestinoId, setAulaDestinoId] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [estudiantesData, tiposDocData, aulasData, sedesData, institucionesData] = await Promise.all([
        estudiantesService.getAll(),
        tipoDocumentoService.getAll(),
        aulasService.getAll(),
        sedesService.getAll(),
        institucionesService.getAll(),
      ]);
      setEstudiantes(estudiantesData);
      setTiposDoc(tiposDocData);
      setAulas(aulasData);
      setSedes(sedesData);
      setInstituciones(institucionesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      codigo: '',
      nombre: '',
      apellidos: '',
      tipo_doc: 0,
      score_in: undefined,
      score_out: undefined,
    });
    setShowForm(true);
  };

  const handleEdit = (e: Estudiante) => {
    setEditingId(e.id);
    setFormData({
      codigo: e.codigo,
      nombre: e.nombre,
      apellidos: e.apellidos,
      tipo_doc: e.tipo_doc,
      score_in: e.score_in ?? undefined,
      score_out: e.score_out ?? undefined,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.nombre || !formData.apellidos || !formData.tipo_doc) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingId) {
        await estudiantesService.update(editingId, formData);
      } else {
        await estudiantesService.create(formData);
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      // Error handled by api-client
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este estudiante?')) {
      try {
        await estudiantesService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleMoverAula = (e: Estudiante) => {
    setEstudianteMover(e);
    setAulaDestinoId(0);
    setShowMoverAula(true);
  };

  const handleConfirmMover = async () => {
    if (!estudianteMover || !aulaDestinoId) return;

    try {
      if (estudianteMover.aula_actual_id) {
        // Mover
        await estudiantesService.moverAula(estudianteMover.id, {
          id_aula_destino: aulaDestinoId,
        });
      } else {
        // Asignar
        await estudiantesService.asignarAula(estudianteMover.id, {
          id_aula: aulaDestinoId,
        });
      }
      setShowMoverAula(false);
      setEstudianteMover(null);
      setAulaDestinoId(0);
      fetchData();
    } catch (error) {
      console.error('Error moviendo estudiante:', error);
      // Error handled by api-client
    }
  };

  const filteredEstudiantes = estudiantes.filter((e) =>
    search === '' ||
    e.codigo.toLowerCase().includes(search.toLowerCase()) ||
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.apellidos.toLowerCase().includes(search.toLowerCase())
  );

  const getTipoDocLabel = (id: number) => {
    return tiposDoc.find((t) => t.id === id)?.sigla || '—';
  };

  const getAulaLabel = (id: number | null) => {
    if (!id) return '—';
    const aula = aulas.find((a) => a.id === id);
    return aula ? `${aula.grado}°${aula.grupo}` : '—';
  };

  const getInstitucionLabel = (aulaId: number | null) => {
    if (!aulaId) return '—';
    const aula = aulas.find((a) => a.id === aulaId);
    if (!aula) return '—';
    const sede = sedes.find((s) => s.id === aula.id_sede);
    if (!sede) return '—';
    const institucion = instituciones.find((i) => i.id === sede.id_inst);
    return institucion ? institucion.nombre : '—';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              Estudiantes
            </CardTitle>
            <CardDescription>Gestión de estudiantes del programa</CardDescription>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Agregar Estudiante
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Cargando estudiantes...
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código, nombre o apellidos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Tipo Doc</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Institución</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Aula</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Score IN</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Score OUT</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEstudiantes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500 italic">
                        {search
                          ? 'No se encontraron estudiantes con ese criterio'
                          : 'No hay estudiantes registrados. Haz clic en "Agregar Estudiante" para comenzar.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEstudiantes.map((e) => (
                      <tr key={e.id} className="hover:bg-green-50 transition-colors border-b border-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.codigo}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.nombre} {e.apellidos}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getTipoDocLabel(e.tipo_doc)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getInstitucionLabel(e.aula_actual_id || null)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getAulaLabel(e.aula_actual_id || null)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{e.score_in ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{e.score_out ?? '—'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(e)}
                              className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoverAula(e)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 hover:text-green-700"
                              title={e.aula_actual_id ? 'Mover de aula' : 'Asignar aula'}
                            >
                              <MoveRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {editingId ? 'Editar' : 'Nuevo'} Estudiante
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Código *</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos *</label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento *</label>
                  <select
                    value={formData.tipo_doc}
                    onChange={(e) => setFormData({ ...formData, tipo_doc: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                    required
                  >
                    <option value={0}>Seleccione...</option>
                    {tiposDoc.map((t) => (
                      <option key={t.id} value={t.id}>{t.sigla} - {t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Score IN</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.score_in ?? ''}
                      onChange={(e) => setFormData({ ...formData, score_in: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                      placeholder="0-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Score OUT</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.score_out ?? ''}
                      onChange={(e) => setFormData({ ...formData, score_out: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                      placeholder="0-100"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mover Aula Modal */}
        {showMoverAula && estudianteMover && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {estudianteMover.aula_actual_id ? 'Mover' : 'Asignar'} Aula
              </h3>
              <div className="mb-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {estudianteMover.nombre} {estudianteMover.apellidos}
                </p>
                <p className="text-xs text-gray-600">
                  Aula actual: <span className="font-semibold">{getAulaLabel(estudianteMover.aula_actual_id || null)}</span>
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Aula Destino *</label>
                <select
                  value={aulaDestinoId}
                  onChange={(e) => setAulaDestinoId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                >
                  <option value={0}>Seleccione...</option>
                  {aulas
                    .filter(a => {
                      if (!estudianteMover.aula_actual_id) return true;
                      const currentAula = aulas.find(ca => ca.id === estudianteMover.aula_actual_id);
                      if (!currentAula) return true;

                      const isPrimary = currentAula.grado === 4 || currentAula.grado === 5;
                      const isSecondary = currentAula.grado === 9 || currentAula.grado === 10;

                      if (isPrimary) return a.grado === 4 || a.grado === 5;
                      if (isSecondary) return a.grado === 9 || a.grado === 10;
                      return true;
                    })
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.grado}° {a.grupo} - Sede {sedes.find(s => s.id === a.id_sede)?.nombre || a.id_sede}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => setShowMoverAula(false)}
                  className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmMover}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstudiantesTab;
