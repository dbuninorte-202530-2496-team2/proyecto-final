// src/components/Dashboard/tabs/AulasTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { Aula } from '../../../types/aula';
import type { Institucion } from '../../../types/institucion';
import type { Sede } from '../../../types/sede';
import AulasForm, { type InstitucionIdFilter } from './AulasForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Search, Plus, Edit2, Trash2, Eye, Zap, BookOpen } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

type SedeIdFilter = number | 'all';

const gradosPermitidos = [4, 5, 9, 10];

const getProgramaFromGrado = (grado: number) =>
  grado === 4 || grado === 5 ? 'INSIDECLASSROOM' : 'OUTSIDECLASSROOM';

const AulasTab: React.FC = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  const [selectedInstitucionId, setSelectedInstitucionId] =
    useState<InstitucionIdFilter>('all');
  const [selectedSedeId, setSelectedSedeId] =
    useState<SedeIdFilter>('all');
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Aula>>({
    grado: 4,
    grupo: '',
    id_sede: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------- CARGA INICIAL ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [instRes, sedesRes, aulasRes] = await Promise.all([
          fetch(`${API_URL}/instituciones`),
          fetch(`${API_URL}/sedes`),
          fetch(`${API_URL}/aulas`),
        ]);

        const [instData, sedesData, aulasData] = await Promise.all([
          instRes.json(),
          sedesRes.json(),
          aulasRes.json(),
        ]);

        setInstituciones(instData);
        setSedes(sedesData);
        setAulas(aulasData);
      } catch (err) {
        console.error('Error cargando datos de aulas:', err);
      }
    };

    fetchAll();
  }, []);

  // ---------- FILTROS ----------
  const sedesFiltradasPorInstitucion = useMemo(() => {
    if (selectedInstitucionId === 'all') return sedes;
    return sedes.filter((s) => s.id_inst === selectedInstitucionId);
  }, [sedes, selectedInstitucionId]);

  const aulasFiltradas = useMemo(() => {
    return aulas.filter((aula) => {
      const sede = sedes.find((s) => s.id === aula.id_sede);
      const institucion = instituciones.find((i) => i.id === sede?.id_inst);

      const coincideInst =
        selectedInstitucionId === 'all' ||
        institucion?.id === selectedInstitucionId;
      const coincideSede =
        selectedSedeId === 'all' || sede?.id === selectedSedeId;

      const termino = search.toLowerCase().trim();
      const coincideSearch =
        termino === '' ||
        aula.grupo.toLowerCase().includes(termino) ||
        (sede?.nombre || '').toLowerCase().includes(termino) ||
        (institucion?.nombre || '').toLowerCase().includes(termino);

      return coincideInst && coincideSede && coincideSearch;
    });
  }, [
    aulas,
    sedes,
    instituciones,
    selectedInstitucionId,
    selectedSedeId,
    search,
  ]);

  // ---------- MANEJO FORMULARIO ----------
  const openCreateForm = () => {
    setIsEditing(false);
    setFormData({
      grado: 4,
      grupo: '',
      id_sede: sedesFiltradasPorInstitucion[0]?.id ?? 0,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (aula: Aula) => {
    setIsEditing(true);
    setFormData(aula);
    setFormError(null);
    setIsFormOpen(true);

    const sede = sedes.find((s) => s.id === aula.id_sede);
    if (sede) {
      setSelectedInstitucionId(sede.id_inst);
      setSelectedSedeId(sede.id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({
      grado: 4,
      grupo: '',
      id_sede: 0,
    });
    setFormError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'grado' || name === 'id_sede'
          ? Number(value)
          : value.toUpperCase(),
    }));
  };

  const handleChangeInstitucion = (value: InstitucionIdFilter) => {
    setSelectedInstitucionId(value);
    setSelectedSedeId('all');
    setFormData((prev) => ({
      ...prev,
      id_sede: 0,
    }));
  };

  const validateForm = () => {
    if (!formData.grado || !gradosPermitidos.includes(formData.grado)) {
      return 'El grado debe ser 4, 5, 9 o 10.';
    }
    if (!formData.grupo || formData.grupo.trim() === '') {
      return 'El grupo es obligatorio.';
    }
    if (formData.grupo.trim().length > 1) {
      return 'El grupo debe ser una sola letra (A, B, C, etc.).';
    }
    if (!/^[A-Z]$/.test(formData.grupo)) {
      return 'El grupo debe ser una letra en mayúscula (A-Z).';
    }
    if (!formData.id_sede || formData.id_sede === 0) {
      return 'Debes seleccionar una sede.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        grado: formData.grado,
        grupo: formData.grupo?.trim().toUpperCase(),
        id_sede: formData.id_sede,
      };

      if (isEditing && formData.id != null) {
        const res = await fetch(`${API_URL}/aulas/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Error actualizando aula');
      } else {
        const res = await fetch(`${API_URL}/aulas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Error creando aula');
      }

      const aulasRes = await fetch(`${API_URL}/aulas`);
      const aulasData = await aulasRes.json();
      setAulas(aulasData);

      closeForm();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Ocurrió un error al guardar el aula.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta aula?')) return;

    try {
      const res = await fetch(`${API_URL}/aulas/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error eliminando aula');

      setAulas((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar el aula.');
    }
  };

  const totalAulas = aulasFiltradas.length;
  const aulasCuarto = aulasFiltradas.filter(a => a.grado === 4 || a.grado === 5).length;
  const aulas9_10 = aulasFiltradas.filter(a => a.grado === 9 || a.grado === 10).length;

  // ---------- RENDER ----------
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
            onClick={openCreateForm}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Crear Aula
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por institución, sede o grupo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
            />
          </div>

          {/* Filtros de institución y sede */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Institución</label>
              <select
                value={selectedInstitucionId === 'all' ? 'all' : selectedInstitucionId}
                onChange={(e) => {
                  const value = e.target.value;
                  const newValue: InstitucionIdFilter = value === 'all' ? 'all' : Number(value);
                  handleChangeInstitucion(newValue);
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
              >
                <option value="all">Todas las instituciones</option>
                {instituciones.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sede</label>
              <select
                value={selectedSedeId === 'all' ? 'all' : selectedSedeId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedSedeId(value === 'all' ? 'all' : Number(value));
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
              >
                <option value="all">Todas las sedes</option>
                {sedesFiltradasPorInstitucion.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de aulas */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-6">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Grupo</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Grado</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Programa</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Sede</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Institución</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aulasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500 italic">
                    {search || selectedInstitucionId !== 'all' || selectedSedeId !== 'all'
                      ? 'No se encontraron aulas con ese criterio de búsqueda'
                      : 'No hay aulas registradas. Haz clic en "Crear Aula" para comenzar.'}
                  </td>
                </tr>
              ) : (
                aulasFiltradas.map((aula) => {
                  const sede = sedes.find(s => s.id === aula.id_sede);
                  const institucion = instituciones.find(i => i.id === sede?.id_inst);
                  const programa = getProgramaFromGrado(aula.grado);
                  
                  return (
                    <tr key={aula.id} className="hover:bg-green-50 transition-colors border-b border-gray-100">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          {aula.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                          <BookOpen className="w-4 h-4" />
                          Grupo {aula.grupo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          Grado {aula.grado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          programa === 'INSIDECLASSROOM'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {programa === 'INSIDECLASSROOM' ? '📚 Inside Classroom' : '🌍 Outside Classroom'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                          📍 {sede?.nombre || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                          🏫 {institucion?.nombre || 'N/A'}
                        </div>
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
                            onClick={() => openEditForm(aula)}
                            className="p-2 hover:bg-amber-100 rounded-lg transition-all text-amber-600 hover:text-amber-700 font-semibold transform hover:scale-110 duration-150"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(aula.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600 hover:text-red-700 font-semibold transform hover:scale-110 duration-150"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen estadístico */}
        {aulasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Total de Aulas</p>
                  <p className="text-2xl font-bold text-blue-900">{totalAulas}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-semibold">Grados 4-5 (Inside)</p>
                  <p className="text-2xl font-bold text-purple-900">{aulasCuarto}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-semibold">Grados 9-10 (Outside)</p>
                  <p className="text-2xl font-bold text-indigo-900">{aulas9_10}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Formulario modal */}
      {isFormOpen && (
        <AulasForm
          isEditing={isEditing}
          formData={formData}
          instituciones={instituciones}
          sedesFiltradas={sedesFiltradasPorInstitucion}
          selectedInstitucionId={selectedInstitucionId}
          formError={formError}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          onChangeInstitucion={handleChangeInstitucion}
        />
      )}
    </Card>
  );
};

export default AulasTab;
