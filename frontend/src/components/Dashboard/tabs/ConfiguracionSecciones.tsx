import React, { useMemo, useState } from 'react';

import type { Festivo } from '../../../types/festivo';
import type { Motivo } from '../../../types/registroClases';
import type { Periodo } from '../../../types/periodo';
import type { Componente } from '../../../types/nota';
import type { TipoDocumento } from '../../../types/tipoDocumento';

import {
  CalendarDays,
  AlertCircle,
  Layers,
  ListChecks,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';

import {
  festivosService,
  motivosService,
  tipoDocumentoService,
  periodosService,
  componentesService,
  type CreateFestivoDto,
  type CreateTipoDocumentoDto
} from '../../../services/api';

export const ConfiguracionCatalogosBasicos: React.FC = () => {
  // estados
  const [festivos, setFestivos] = useState<Festivo[]>([]);
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);

  const [newFestivo, setNewFestivo] = useState<CreateFestivoDto>({
    fecha: '',
    descripcion: '',
  });

  const [newMotivo, setNewMotivo] = useState('');
  const [newTipoDoc, setNewTipoDoc] = useState<CreateTipoDocumentoDto>({
    nombre: '',
    sigla: '',
  });

  const [searchFestivos, setSearchFestivos] = useState('');
  const [searchMotivos, setSearchMotivos] = useState('');
  const [searchTiposDoc, setSearchTiposDoc] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [festivosData, motivosData, tiposDocData] = await Promise.all([
        festivosService.getAll(),
        motivosService.getAll(),
        tipoDocumentoService.getAll(),
      ]);
      setFestivos(festivosData);
      setMotivos(motivosData);
      setTiposDoc(tiposDocData);
    } catch (error) {
      console.error('Error loading catalogs:', error);
      alert('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // filtros
  const festivosFiltrados = useMemo(
    () =>
      festivos.filter(
        (f) =>
          f.descripcion.toLowerCase().includes(searchFestivos.toLowerCase()) ||
          f.fecha.includes(searchFestivos),
      ),
    [festivos, searchFestivos],
  );

  const motivosFiltrados = useMemo(
    () =>
      motivos.filter((m) =>
        m.descripcion.toLowerCase().includes(searchMotivos.toLowerCase()),
      ),
    [motivos, searchMotivos],
  );

  const tiposDocFiltrados = useMemo(
    () =>
      tiposDoc.filter(
        (t) =>
          t.nombre.toLowerCase().includes(searchTiposDoc.toLowerCase()) ||
          t.sigla.toLowerCase().includes(searchTiposDoc.toLowerCase()),
      ),
    [tiposDoc, searchTiposDoc],
  );

  const stats = useMemo(
    () => ({
      totalFestivos: festivos.length,
      totalMotivos: motivos.length,
      totalTiposDoc: tiposDoc.length,
    }),
    [festivos.length, motivos.length, tiposDoc.length],
  );

  // handlers festivos
  const handleAddFestivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFestivo.fecha || !newFestivo.descripcion.trim()) return;

    try {
      await festivosService.create({
        ...newFestivo,
        descripcion: newFestivo.descripcion.trim(),
      });
      setNewFestivo({ fecha: '', descripcion: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating festivo:', error);
      alert('Error al crear festivo');
    }
  };

  const handleDeleteFestivo = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este festivo?')) return;
    try {
      await festivosService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting festivo:', error);
      alert('Error al eliminar festivo');
    }
  };

  // handlers motivos
  const handleAddMotivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMotivo.trim()) return;

    try {
      await motivosService.create({ descripcion: newMotivo.trim() });
      setNewMotivo('');
      fetchData();
    } catch (error) {
      console.error('Error creating motivo:', error);
      alert('Error al crear motivo');
    }
  };

  const handleDeleteMotivo = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este motivo?')) return;
    try {
      await motivosService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting motivo:', error);
      alert('Error al eliminar motivo');
    }
  };

  // handlers tipos documento
  const handleAddTipoDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipoDoc.sigla.trim() || !newTipoDoc.nombre.trim()) return;

    try {
      await tipoDocumentoService.create({
        sigla: newTipoDoc.sigla.trim().toUpperCase(),
        nombre: newTipoDoc.nombre.trim(),
      });
      setNewTipoDoc({ nombre: '', sigla: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating tipo documento:', error);
      alert('Error al crear tipo de documento');
    }
  };

  const handleDeleteTipoDoc = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este tipo de documento?')) return;
    try {
      await tipoDocumentoService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting tipo documento:', error);
      alert('Error al eliminar tipo de documento');
    }
  };

  // render
  return (
    <section className="space-y-8 animate-fadeIn">
      {/* Encabezado de sección */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Catálogos Básicos</h2>
        {/* Resumen rápido de stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border-l-4 border-emerald-500 hover:shadow-md transition-all">
            <div className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">
              Festivos
            </div>
            <div className="text-3xl font-bold text-emerald-900 mt-2">
              {loading ? '...' : stats.totalFestivos}
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Días sin clases en el calendario
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-500 hover:shadow-md transition-all">
            <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide">
              Motivos de ausencia
            </div>
            <div className="text-3xl font-bold text-orange-900 mt-2">
              {loading ? '...' : stats.totalMotivos}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Razones para justificar inasistencias
            </p>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 border-l-4 border-sky-500 hover:shadow-md transition-all">
            <div className="text-sky-600 text-sm font-semibold uppercase tracking-wide">
              Tipos de documento
            </div>
            <div className="text-3xl font-bold text-sky-900 mt-2">
              {loading ? '...' : stats.totalTiposDoc}
            </div>
            <p className="text-xs text-sky-700 mt-1">
              Catálogo usado al registrar estudiantes
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* FESTIVOS */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100">
              <CalendarDays className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Festivos</h3>
              <p className="text-sm text-gray-500">
                Días sin actividades académicas
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar festivo..."
                value={searchFestivos}
                onChange={(e) => setSearchFestivos(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all hover:border-emerald-300 text-sm"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b-2 border-emerald-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {festivosFiltrados.length > 0 ? (
                    festivosFiltrados.map((f, idx) => (
                      <tr
                        key={f.id}
                        className={`border-b transition-colors hover:bg-emerald-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {f.fecha}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {f.descripcion}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteFestivo(f.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-all hover:scale-110 duration-150"
                            title="Eliminar festivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-sm text-gray-400 italic"
                      >
                        {searchFestivos
                          ? 'Sin festivos coincidentes'
                          : 'Sin festivos definidos'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={handleAddFestivo}
            className="grid grid-cols-1 sm:grid-cols-[120px,1fr,auto] gap-2"
          >
            <input
              type="date"
              value={newFestivo.fecha}
              onChange={(e) =>
                setNewFestivo((prev: CreateFestivoDto) => ({ ...prev, fecha: e.target.value }))
              }
              className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all hover:border-emerald-300 text-sm"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newFestivo.descripcion}
              onChange={(e) =>
                setNewFestivo((prev: CreateFestivoDto) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all hover:border-emerald-300 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-semibold transition-all hover:shadow-md transform hover:scale-105 duration-150 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </form>
        </div>

        {/* MOTIVOS + TIPOS DOC */}
        <div className="space-y-12">
          {/* Motivos - Subsección */}
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Motivos de Ausencia
                </h3>
                <p className="text-sm text-gray-500">
                  Razones para registrar inasistencias
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-4 border border-orange-200 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar motivo..."
                  value={searchMotivos}
                  onChange={(e) => setSearchMotivos(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-all hover:border-orange-300 text-sm"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-orange-900 uppercase tracking-wider">
                        Motivo
                      </th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {motivosFiltrados.length > 0 ? (
                      motivosFiltrados.map((m, idx) => (
                        <tr
                          key={m.id}
                          className={`border-b transition-colors hover:bg-orange-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                        >
                          <td className="px-4 py-3 text-gray-700">
                            {m.descripcion}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteMotivo(m.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-all hover:scale-110 duration-150"
                              title="Eliminar motivo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-6 text-center text-sm text-gray-400 italic"
                        >
                          {searchMotivos
                            ? 'Sin motivos coincidentes'
                            : 'Sin motivos definidos'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <form
              onSubmit={handleAddMotivo}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Ej: Enfermedad"
                value={newMotivo}
                onChange={(e) => setNewMotivo(e.target.value)}
                className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-all hover:border-orange-300 text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold transition-all hover:shadow-md transform hover:scale-105 duration-150 shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </form>
          </div>

          {/* Tipos de documento */}
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-100">
                <Layers className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Tipos de Documento
                </h3>
                <p className="text-sm text-gray-500">
                  Catálogo usado al registrar estudiantes
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por sigla o nombre..."
                  value={searchTiposDoc}
                  onChange={(e) => setSearchTiposDoc(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all hover:border-sky-300 text-sm"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-sky-50 to-sky-100 border-b-2 border-sky-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-sky-900 uppercase tracking-wider">
                        Sigla
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-sky-900 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {tiposDocFiltrados.length > 0 ? (
                      tiposDocFiltrados.map((t, idx) => (
                        <tr
                          key={t.id}
                          className={`border-b transition-colors hover:bg-sky-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                        >
                          <td className="px-4 py-3 text-sky-800 font-semibold">
                            {t.sigla}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {t.nombre}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteTipoDoc(t.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-all hover:scale-110 duration-150"
                              title="Eliminar tipo de documento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-sm text-gray-400 italic"
                        >
                          {searchTiposDoc
                            ? 'Sin tipos de documento coincidentes'
                            : 'Sin tipos de documento definidos'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <form
              onSubmit={handleAddTipoDoc}
              className="grid grid-cols-1 sm:grid-cols-[120px,1fr,auto] gap-2"
            >
              <input
                type="text"
                placeholder="Sigla (ej: CC)"
                value={newTipoDoc.sigla}
                onChange={(e) =>
                  setNewTipoDoc((prev: CreateTipoDocumentoDto) => ({
                    ...prev,
                    sigla: e.target.value,
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all hover:border-sky-300 text-sm uppercase"
              />
              <input
                type="text"
                placeholder="Nombre completo"
                value={newTipoDoc.nombre}
                onChange={(e) =>
                  setNewTipoDoc((prev: CreateTipoDocumentoDto) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all hover:border-sky-300 text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-sm font-semibold transition-all hover:shadow-md transform hover:scale-105 duration-150 shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

//PERIODOS ACADÉMICOS Y COMPONENTES DE NOTA

export const ConfiguracionAcademicaEvaluacion: React.FC = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [periodosSemanas, setPeriodosSemanas] = useState<Map<number, { primera?: string; ultima?: string }>>(new Map());
  const [loading, setLoading] = useState(true);

  const [newPeriodo, setNewPeriodo] = useState({
    anho: new Date().getFullYear(),
    numero: 1,
  });

  const [newComponente, setNewComponente] = useState({
    nombre: '',
    tipo_programa: 1, // 1 = INSIDECLASSROOM
    porcentaje: 0,
    id_periodo: 0,
  });

  const [searchPeriodos, setSearchPeriodos] = useState('');
  const [searchComponentes, setSearchComponentes] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const periodosData = await periodosService.getAll();
      setPeriodos(periodosData);

      // Fetch semanas for each periodo to get first and last week
      const semanasMap = new Map<number, { primera?: string; ultima?: string }>();
      for (const periodo of periodosData) {
        try {
          const semanas = await periodosService.getSemanasByPeriodo(periodo.id);
          if (semanas.length > 0) {
            semanasMap.set(periodo.id, {
              primera: semanas[0].fec_ini,
              ultima: semanas[semanas.length - 1].fec_fin,
            });
          }
        } catch (error) {
          console.error(`Error loading semanas for periodo ${periodo.id}:`, error);
        }
      }
      setPeriodosSemanas(semanasMap);

      // Fetch all componentes for all periodos
      if (periodosData.length > 0) {
        const allComponentes: Componente[] = [];
        for (const periodo of periodosData) {
          const comps = await componentesService.getByPeriodo(periodo.id);
          allComponentes.push(...comps);
        }
        setComponentes(allComponentes);

        // Set default periodo for new componente
        if (periodosData.length > 0 && newComponente.id_periodo === 0) {
          setNewComponente(prev => ({ ...prev, id_periodo: periodosData[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();

    // Listen for changes from other components
    const handleDataChange = () => {
      fetchData();
    };

    window.addEventListener('periodos-updated', handleDataChange);
    window.addEventListener('semanas-updated', handleDataChange);

    return () => {
      window.removeEventListener('periodos-updated', handleDataChange);
      window.removeEventListener('semanas-updated', handleDataChange);
    };
  }, []);

  const periodosFiltrados = useMemo(
    () =>
      periodos.filter(
        (p) => {
          const nombre = `${p.anho}-${p.numero}`;
          return nombre.toLowerCase().includes(searchPeriodos.toLowerCase()) ||
            p.anho.toString().includes(searchPeriodos);
        }
      ),
    [periodos, searchPeriodos],
  );

  const componentesFiltrados = useMemo(
    () =>
      componentes.filter(
        (c) => {
          const periodo = periodos.find((p) => p.id === c.id_periodo);
          const periodoNombre = periodo ? `${periodo.anho}-${periodo.numero}` : '';
          return c.nombre.toLowerCase().includes(searchComponentes.toLowerCase()) ||
            periodoNombre.toLowerCase().includes(searchComponentes.toLowerCase());
        }
      ),
    [componentes, searchComponentes, periodos],
  );

  const stats = useMemo(
    () => ({
      totalPeriodos: periodos.length,
      totalComponentes: componentes.length,
    }),
    [periodos.length, componentes.length],
  );

  // handlers periodos
  const handleAddPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodo.anho || !newPeriodo.numero) return;

    try {
      await periodosService.create({
        anho: newPeriodo.anho,
        numero: newPeriodo.numero,
      });
      setNewPeriodo({
        anho: new Date().getFullYear(),
        numero: 1,
      });
      fetchData();
      // Notify other components
      window.dispatchEvent(new CustomEvent('periodos-updated'));
    } catch (error) {
      console.error('Error creating periodo:', error);
    }
  };

  const handleDeletePeriodo = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este período?')) return;
    try {
      await periodosService.delete(id);
      fetchData();
      // Notify other components
      window.dispatchEvent(new CustomEvent('periodos-updated'));
    } catch (error) {
      console.error('Error deleting periodo:', error);
    }
  };

  // handlers componentes
  const handleAddComponente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponente.nombre.trim()) return;

    try {
      await componentesService.create({
        nombre: newComponente.nombre.trim(),
        tipo_programa: newComponente.tipo_programa,
        porcentaje: newComponente.porcentaje,
        id_periodo: newComponente.id_periodo,
      });
      setNewComponente({
        nombre: '',
        tipo_programa: 1,
        porcentaje: 0,
        id_periodo: periodos[0]?.id ?? 0,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating componente:', error);
    }
  };

  const handleDeleteComponente = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este componente?')) return;
    try {
      await componentesService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting componente:', error);
    }
  };

  const getPeriodoNombre = (p: Periodo) => `${p.anho}-${p.numero}`;
  const getTipoProgramaLabel = (tipo: number) => tipo === 1 ? 'Inside' : 'Outside';

  // render
  return (
    <section className="space-y-8 animate-fadeIn">
      {/* Encabezado de sección */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Períodos Académicos y Evaluación</h2>
        {/* Resumen rápido de stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border-l-4 border-indigo-500 hover:shadow-md transition-all">
            <div className="text-indigo-600 text-sm font-semibold uppercase tracking-wide">
              Períodos académicos
            </div>
            <div className="text-3xl font-bold text-indigo-900 mt-2">
              {loading ? '...' : stats.totalPeriodos}
            </div>
            <p className="text-xs text-indigo-700 mt-1">
              Rangos de fechas para el programa
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500 hover:shadow-md transition-all">
            <div className="text-purple-600 text-sm font-semibold uppercase tracking-wide">
              Componentes de nota
            </div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {loading ? '...' : stats.totalComponentes}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Criterios de evaluación Inside / Outside
            </p>
          </div>
        </div>
      </div>

      {/* Componentes de evaluación */}
      <section className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-100">
            <ListChecks className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Componentes de Evaluación
            </h3>
            <p className="text-sm text-gray-500">
              Criterios y pesos para calificación
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o período..."
              value={searchComponentes}
              onChange={(e) => setSearchComponentes(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all hover:border-purple-300 text-sm"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
          <div className="max-h-72 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Peso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {componentesFiltrados.length > 0 ? (
                  componentesFiltrados.map((c, idx) => {
                    const periodo = periodos.find((p) => p.id === c.id_periodo);
                    return (
                      <tr
                        key={c.id}
                        className={`border-b transition-colors hover:bg-purple-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {c.nombre}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {getTipoProgramaLabel(c.tipo_programa)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-purple-600">
                          {c.porcentaje}%
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm">
                          {periodo ? getPeriodoNombre(periodo) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteComponente(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-all hover:scale-110 duration-150"
                            title="Eliminar componente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-400 italic"
                    >
                      {searchComponentes
                        ? 'Sin componentes coincidentes'
                        : 'Sin componentes definidos'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleAddComponente}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
        >
          <input
            type="text"
            placeholder="Nombre"
            value={newComponente.nombre}
            onChange={(e) =>
              setNewComponente((prev) => ({ ...prev, nombre: e.target.value }))
            }
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all hover:border-purple-300 text-sm"
          />

          <select
            value={newComponente.tipo_programa}
            onChange={(e) =>
              setNewComponente((prev) => ({
                ...prev,
                tipo_programa: Number(e.target.value),
              }))
            }
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all hover:border-purple-300 text-sm bg-white"
          >
            <option value={1}>Inside</option>
            <option value={2}>Outside</option>
          </select>

          <input
            type="number"
            min={0}
            max={100}
            placeholder="Peso %"
            value={newComponente.porcentaje}
            onChange={(e) =>
              setNewComponente((prev) => ({
                ...prev,
                porcentaje: Number(e.target.value),
              }))
            }
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all hover:border-purple-300 text-sm"
          />

          <select
            value={newComponente.id_periodo}
            onChange={(e) =>
              setNewComponente((prev) => ({
                ...prev,
                id_periodo: Number(e.target.value),
              }))
            }
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all hover:border-purple-300 text-sm bg-white"
          >
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                {getPeriodoNombre(p)}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold transition-all hover:shadow-md transform hover:scale-105 duration-150 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </form>
      </section>
      {/* Períodos */}
      <section className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-100">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Períodos Académicos
            </h3>
            <p className="text-sm text-gray-500">
              Ciclos escolares que agrupan semanas y evaluaciones
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por año o número..."
              value={searchPeriodos}
              onChange={(e) => setSearchPeriodos(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all hover:border-indigo-300 text-sm"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
          <div className="max-h-72 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b-2 border-indigo-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Semana Inicio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Semana Fin
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {periodosFiltrados.length > 0 ? (
                  periodosFiltrados.map((p, idx) => {
                    const semanas = periodosSemanas.get(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b transition-colors hover:bg-indigo-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {getPeriodoNombre(p)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.anho}</td>
                        <td className="px-4 py-3 text-gray-700">{p.numero}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {semanas?.primera ? semanas.primera.split('T')[0] : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {semanas?.ultima ? semanas.ultima.split('T')[0] : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePeriodo(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-all hover:scale-110 duration-150"
                            title="Eliminar período"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-gray-400 italic"
                    >
                      {searchPeriodos
                        ? 'Sin períodos coincidentes'
                        : 'Sin períodos definidos'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleAddPeriodo}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          <input
            type="number"
            placeholder="Año"
            value={newPeriodo.anho}
            onChange={(e) =>
              setNewPeriodo((prev) => ({
                ...prev,
                anho: Number(e.target.value),
              }))
            }
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all hover:border-indigo-300 text-sm"
          />
          <input
            type="number"
            placeholder="Número (1, 2, etc.)"
            min="1"
            value={newPeriodo.numero}
            onChange={(e) =>
              setNewPeriodo((prev) => ({
                ...prev,
                numero: Number(e.target.value),
              }))
            }
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all hover:border-indigo-300 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold transition-all hover:shadow-md transform hover:scale-105 duration-150 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </form>
      </section>
    </section>
  );
};
