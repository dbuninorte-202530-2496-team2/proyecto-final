import React, { useState, useMemo } from 'react';

import type { Festivo } from '../../../types/festivo';
import type { Periodo } from '../../../types/periodo';
import type { Motivo } from '../../../types/registroClases';
import type { Componente } from '../../../types/nota';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';

import {
  CalendarDays,
  AlertCircle,
  Layers,
  ListChecks,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';

const ConfiguracionTab: React.FC = () => {

  const [festivos, setFestivos] = useState<Festivo[]>([
    { id: 1, fecha: '2025-01-01', descripcion: 'Año Nuevo' },
    { id: 2, fecha: '2025-03-24', descripcion: 'Festivo de marzo' },
  ]);

  const [motivos, setMotivos] = useState<Motivo[]>([
    { id: 1, descripcion: 'Enfermedad' },
    { id: 2, descripcion: 'Actividad institucional' },
    { id: 3, descripcion: 'Transporte / movilidad' },
  ]);

  const [periodos, setPeriodos] = useState<Periodo[]>([
    {
      id: 1,
      nombre: '2025-1',
      anio: 2025,
      fec_ini: '2025-01-20',
      fec_fin: '2025-06-15',
    },
    {
      id: 2,
      nombre: '2025-2',
      anio: 2025,
      fec_ini: '2025-07-15',
      fec_fin: '2025-12-01',
    },
  ]);

  const [componentes, setComponentes] = useState<Componente[]>([
    {
      id: 1,
      nombre: 'Inside – Participación',
      tipo_programa: 'INSIDECLASSROOM',
      porcentaje: 30,
      id_periodo: 1,
    },
    {
      id: 2,
      nombre: 'Inside – Evaluación final',
      tipo_programa: 'INSIDECLASSROOM',
      porcentaje: 70,
      id_periodo: 1,
    },
    {
      id: 3,
      nombre: 'Outside – Proyecto',
      tipo_programa: 'OUTSIDECLASSROOM',
      porcentaje: 40,
      id_periodo: 1,
    },
  ]);

  const [newFestivo, setNewFestivo] = useState<Festivo>({
    id: 0,
    fecha: '',
    descripcion: '',
  });

  const [newMotivo, setNewMotivo] = useState<string>('');

  const [newPeriodo, setNewPeriodo] = useState<Periodo>({
    id: 0,
    nombre: '',
    anio: new Date().getFullYear(),
    fec_ini: '',
    fec_fin: '',
  });

  const [newComponente, setNewComponente] = useState<Componente>({
    id: 0,
    nombre: '',
    tipo_programa: 'INSIDECLASSROOM',
    porcentaje: 0,
    id_periodo: 1,
  });

  const [searchFestivos, setSearchFestivos] = useState('');
  const [searchMotivos, setSearchMotivos] = useState('');
  const [searchPeriodos, setSearchPeriodos] = useState('');
  const [searchComponentes, setSearchComponentes] = useState('');

  const festivosFiltrados = useMemo(
    () =>
      festivos.filter(
        (f) =>
          f.descripcion.toLowerCase().includes(searchFestivos.toLowerCase()) ||
          f.fecha.includes(searchFestivos)
      ),
    [festivos, searchFestivos]
  );

  const motivosFiltrados = useMemo(
    () =>
      motivos.filter((m) =>
        m.descripcion.toLowerCase().includes(searchMotivos.toLowerCase())
      ),
    [motivos, searchMotivos]
  );

  const periodosFiltrados = useMemo(
    () =>
      periodos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchPeriodos.toLowerCase()) ||
          p.anio.toString().includes(searchPeriodos)
      ),
    [periodos, searchPeriodos]
  );

  const componentesFiltrados = useMemo(
    () =>
      componentes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(searchComponentes.toLowerCase()) ||
          periodos
            .find((p) => p.id === c.id_periodo)
            ?.nombre.toLowerCase()
            .includes(searchComponentes.toLowerCase())
      ),
    [componentes, searchComponentes, periodos]
  );

  const estadisticas = useMemo(
    () => ({
      totalFestivos: festivos.length,
      totalMotivos: motivos.length,
      totalPeriodos: periodos.length,
      totalComponentes: componentes.length,
    }),
    [festivos.length, motivos.length, periodos.length, componentes.length]
  );

  const generateId = (items: { id: number }[]): number =>
    items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

  // Handlers de los festivos
  const handleAddFestivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFestivo.fecha || !newFestivo.descripcion.trim()) return;

    setFestivos((prev) => [
      ...prev,
      { ...newFestivo, id: generateId(prev), descripcion: newFestivo.descripcion.trim() },
    ]);
    setNewFestivo({ id: 0, fecha: '', descripcion: '' });
  };

  const handleDeleteFestivo = (id: number) => {
    setFestivos((prev) => prev.filter((f) => f.id !== id));
  };

  // Handlers motivos
  const handleAddMotivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMotivo.trim()) return;

    setMotivos((prev) => [
      ...prev,
      { id: generateId(prev), descripcion: newMotivo.trim() },
    ]);
    setNewMotivo('');
  };

  const handleDeleteMotivo = (id: number) => {
    setMotivos((prev) => prev.filter((m) => m.id !== id));
  };

  // Handlers periodo
  const handleAddPeriodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newPeriodo.nombre.trim() ||
      !newPeriodo.fec_ini ||
      !newPeriodo.fec_fin
    )
      return;

    setPeriodos((prev) => [
      ...prev,
      {
        ...newPeriodo,
        id: generateId(prev),
        nombre: newPeriodo.nombre.trim(),
      },
    ]);
    setNewPeriodo({
      id: 0,
      nombre: '',
      anio: new Date().getFullYear(),
      fec_ini: '',
      fec_fin: '',
    });
  };

  const handleDeletePeriodo = (id: number) => {
    setPeriodos((prev) => prev.filter((p) => p.id !== id));
  };

  // Handlers componente
  const handleAddComponente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponente.nombre.trim()) return;

    setComponentes((prev) => [
      ...prev,
      {
        ...newComponente,
        id: generateId(prev),
        nombre: newComponente.nombre.trim(),
      },
    ]);
    setNewComponente({
      id: 0,
      nombre: '',
      tipo_programa: 'INSIDECLASSROOM',
      porcentaje: 0,
      id_periodo: periodos[0]?.id ?? 1,
    });
  };

  const handleDeleteComponente = (id: number) => {
    setComponentes((prev) => prev.filter((c) => c.id !== id));
  };

  // Render
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Configuración del Sistema
            </CardTitle>
            <CardDescription className="text-base">
              Gestión centralizada de catálogos: festivos, motivos de ausencia, períodos y componentes de evaluación
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fadeIn">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border-l-4 border-emerald-500 hover:shadow-md transition-all">
            <div className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">
              Festivos
            </div>
            <div className="text-3xl font-bold text-emerald-900 mt-2">
              {estadisticas.totalFestivos}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-500 hover:shadow-md transition-all">
            <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide">
              Motivos
            </div>
            <div className="text-3xl font-bold text-orange-900 mt-2">
              {estadisticas.totalMotivos}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border-l-4 border-indigo-500 hover:shadow-md transition-all">
            <div className="text-indigo-600 text-sm font-semibold uppercase tracking-wide">
              Períodos
            </div>
            <div className="text-3xl font-bold text-indigo-900 mt-2">
              {estadisticas.totalPeriodos}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500 hover:shadow-md transition-all">
            <div className="text-purple-600 text-sm font-semibold uppercase tracking-wide">
              Componentes
            </div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {estadisticas.totalComponentes}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FESTIVOS */}
          <section className="animate-fadeIn">
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
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {festivosFiltrados.length > 0 ? (
                      festivosFiltrados.map((f, idx) => (
                        <tr
                          key={f.id}
                          className={`border-b transition-colors hover:bg-emerald-50 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
                  setNewFestivo((prev) => ({
                    ...prev,
                    fecha: e.target.value,
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all hover:border-emerald-300 text-sm"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={newFestivo.descripcion}
                onChange={(e) =>
                  setNewFestivo((prev) => ({
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
          </section>

          {/* MOTIVOS */}
          <section className="animate-fadeIn">
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
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {motivosFiltrados.length > 0 ? (
                      motivosFiltrados.map((m, idx) => (
                        <tr
                          key={m.id}
                          className={`border-b transition-colors hover:bg-orange-50 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
          </section>

          {/* PERIODOS */}
          <section className="lg:col-span-2 animate-fadeIn">
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
                  placeholder="Buscar por nombre o año..."
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
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                        Año
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                        Desde
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">
                        Hasta
                      </th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodosFiltrados.length > 0 ? (
                      periodosFiltrados.map((p, idx) => (
                        <tr
                          key={p.id}
                          className={`border-b transition-colors hover:bg-indigo-50 ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {p.nombre}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {p.anio}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {p.fec_ini}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {p.fec_fin}
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
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
            >
              <input
                type="text"
                placeholder="Nombre"
                value={newPeriodo.nombre}
                onChange={(e) =>
                  setNewPeriodo((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all hover:border-indigo-300 text-sm"
              />
              <input
                type="number"
                placeholder="Año"
                value={newPeriodo.anio}
                onChange={(e) =>
                  setNewPeriodo((prev) => ({
                    ...prev,
                    anio: Number(e.target.value),
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all hover:border-indigo-300 text-sm"
              />
              <input
                type="date"
                value={newPeriodo.fec_ini}
                onChange={(e) =>
                  setNewPeriodo((prev) => ({
                    ...prev,
                    fec_ini: e.target.value,
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all hover:border-indigo-300 text-sm"
              />
              <input
                type="date"
                value={newPeriodo.fec_fin}
                onChange={(e) =>
                  setNewPeriodo((prev) => ({
                    ...prev,
                    fec_fin: e.target.value,
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

          {/* COMPONENTES DE NOTA */}
          <section className="lg:col-span-2 animate-fadeIn">
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
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentesFiltrados.length > 0 ? (
                      componentesFiltrados.map((c, idx) => {
                        const periodo = periodos.find(
                          (p) => p.id === c.id_periodo
                        );
                        return (
                          <tr
                            key={c.id}
                            className={`border-b transition-colors hover:bg-purple-50 ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-900 font-medium">
                              {c.nombre}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                {c.tipo_programa === 'INSIDECLASSROOM'
                                  ? 'Inside'
                                  : 'Outside'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-purple-600">
                              {c.porcentaje}%
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-sm">
                              {periodo?.nombre ?? '-'}
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
                  setNewComponente((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all hover:border-purple-300 text-sm"
              />

              <select
                value={newComponente.tipo_programa}
                onChange={(e) =>
                  setNewComponente((prev) => ({
                    ...prev,
                    tipo_programa:
                      e.target.value === 'INSIDECLASSROOM'
                        ? 'INSIDECLASSROOM'
                        : 'OUTSIDECLASSROOM',
                  }))
                }
                className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all hover:border-purple-300 text-sm bg-white"
              >
                <option value="INSIDECLASSROOM">Inside</option>
                <option value="OUTSIDECLASSROOM">Outside</option>
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
                    {p.nombre}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionTab;
