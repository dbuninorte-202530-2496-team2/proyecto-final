import React, { useMemo, useState, useEffect } from 'react';
import type { Horario } from '../../../types/horario';
import HorariosForm from './HorariosForm';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';
import { Search, Plus, Clock3, CalendarDays, Trash2 } from 'lucide-react';
import { horariosService } from '../../../services/api';

type DiaFilter = 'all' | 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SA';

const DIAS_LABEL: Record<string, string> = {
  LU: 'Lunes',
  MA: 'Martes',
  MI: 'Miércoles',
  JU: 'Jueves',
  VI: 'Viernes',
  SA: 'Sábado',
};

const duracionMinutos = (ini: string, fin: string) => {
  const [h1, m1] = ini.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
};

const esDuracionValida = (mins: number) =>
  [40, 45, 50, 55, 60].includes(mins);

// Datos de prueba
const MOCK_HORARIOS: Horario[] = [
  { id: 1, dia_sem: 'LU', hora_ini: '07:00', hora_fin: '07:45' },
  { id: 2, dia_sem: 'LU', hora_ini: '07:45', hora_fin: '08:30' },
  { id: 3, dia_sem: 'MI', hora_ini: '10:00', hora_fin: '10:50' },
  { id: 4, dia_sem: 'SA', hora_ini: '08:00', hora_fin: '08:45' },
];

const HorariosTab: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [diaFilter, setDiaFilter] = useState<DiaFilter>('all');
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<
    Partial<Horario & { _duracionLabel?: string }>
  >({
    dia_sem: 'LU',
    hora_ini: '',
    hora_fin: '',
    _duracionLabel: '—',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const horariosData = await horariosService.getAll();
      setHorarios(horariosData);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      alert('Error al cargar los horarios del servidor');
    } finally {
      setLoading(false);
    }
  };

  // Filtros y búsqueda
  const horariosFiltrados = useMemo(() => {
    return horarios.filter((h) => {
      const coincideDia = diaFilter === 'all' || h.dia_sem === diaFilter;

      const termino = search.toLowerCase().trim();
      const labelDia = DIAS_LABEL[h.dia_sem] ?? '';
      const rango = `${h.hora_ini} - ${h.hora_fin}`;

      const coincideSearch =
        termino === '' ||
        labelDia.toLowerCase().includes(termino) ||
        rango.toLowerCase().includes(termino);

      return coincideDia && coincideSearch;
    });
  }, [horarios, diaFilter, search]);

  // Form lógica

  const recomputeDuracionLabel = (data: Partial<Horario>) => {
    if (!data.hora_ini || !data.hora_fin) return '—';
    const mins = duracionMinutos(data.hora_ini, data.hora_fin);
    if (mins <= 0) return 'Rango inválido';
    return `${mins} min${esDuracionValida(mins) ? '' : ' (fuera de rango)'}`;
  };

  const openCreateForm = () => {
    const base: Partial<Horario> = {
      dia_sem: 'LU',
      hora_ini: '',
      hora_fin: '',
    };
    setFormData({
      ...base,
      _duracionLabel: recomputeDuracionLabel(base),
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev: any) => {
      const next = { ...prev, [name]: value };
      return {
        ...next,
        _duracionLabel: recomputeDuracionLabel(next),
      };
    });
  };

  const validateForm = () => {
    if (!formData.dia_sem) return 'Debes seleccionar un día.';
    if (!formData.hora_ini || !formData.hora_fin) {
      return 'Debes ingresar hora de inicio y fin.';
    }
    const mins = duracionMinutos(formData.hora_ini, formData.hora_fin);
    if (mins <= 0) return 'La hora de fin debe ser mayor que la hora de inicio.';
    if (!esDuracionValida(mins)) {
      return 'La duración debe ser 40, 45, 50, 55 o 60 minutos.';
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

    setIsSubmitting(true);

    try {
      // Construct clean payload with ONLY required fields
      const payload = {
        dia_sem: formData.dia_sem as string,
        hora_ini: formData.hora_ini as string,
        hora_fin: formData.hora_fin as string,
      };
      console.log('Sending horario payload:', payload);
      await horariosService.create(payload);
      closeForm();
      fetchData();
    } catch (error) {
      console.error('Error al guardar horario:', error);
      setFormError('Error al guardar el horario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este horario?')) return;
    try {
      await horariosService.delete(id);
      setHorarios((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error al eliminar horario:', error);
    }
  };

  // Resúmenes

  const totalHorarios = horariosFiltrados.length;
  const totalEntreSemana = horariosFiltrados.filter((h) =>
    ['LU', 'MA', 'MI', 'JU', 'VI'].includes(h.dia_sem),
  ).length;
  const totalSabado = horariosFiltrados.filter(
    (h) => h.dia_sem === 'SA',
  ).length;

  // Render

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="w-6 h-6 text-green-600" />
              Horarios
            </CardTitle>
            <CardDescription>
              Definición de bloques de horario que se asignarán a las aulas.
            </CardDescription>
          </div>
          <button
            onClick={openCreateForm}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Crear Horario
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por día u horario (ej: 07:00)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
            />
          </div>

          <div className="md:w-48">
            <select
              value={diaFilter}
              onChange={(e) => {
                const val = e.target.value as DiaFilter;
                setDiaFilter(val);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
            >
              <option value="all">Todos los días</option>
              <option value="LU">Lunes</option>
              <option value="MA">Martes</option>
              <option value="MI">Miércoles</option>
              <option value="JU">Jueves</option>
              <option value="VI">Viernes</option>
              <option value="SA">Sábado</option>
            </select>
          </div>
        </div>

        {/* Tabla de horarios */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-6">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                  Día
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                  Hora inicio
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                  Hora fin
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {horariosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500 italic"
                  >
                    {search || diaFilter !== 'all'
                      ? 'No se encontraron horarios con ese criterio.'
                      : 'No hay horarios registrados. Haz clic en "Crear Horario" para comenzar.'}
                  </td>
                </tr>
              ) : (
                horariosFiltrados.map((h) => {
                  const mins = duracionMinutos(h.hora_ini, h.hora_fin);
                  const valido = esDuracionValida(mins);

                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-green-50 transition-colors border-b border-gray-100"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          {h.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                          <CalendarDays className="w-3 h-3" />
                          {DIAS_LABEL[h.dia_sem] ?? h.dia_sem}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {h.hora_ini}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {h.hora_fin}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${valido
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {mins} min{!valido && ' (fuera de rango)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleDelete(h.id)}
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
        {horariosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                  <Clock3 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">
                    Bloques definidos
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {totalHorarios}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-sky-700" />
                </div>
                <div>
                  <p className="text-sm text-sky-600 font-semibold">
                    Lunes a Viernes
                  </p>
                  <p className="text-2xl font-bold text-sky-900">
                    {totalEntreSemana}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 font-semibold">
                    Sábados
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {totalSabado}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {isFormOpen && (
        <HorariosForm
          isEditing={false}
          formData={formData}
          formError={formError}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
        />
      )}
    </Card>
  );
};

export default HorariosTab;
