import React, { useMemo, useState } from 'react';

import type { TutorMini } from './ReposicionesForm';
import type { Aula } from '../../../types/aula';
import type { Horario } from '../../../types/horario';
import type { Motivo } from '../../../types/registroClases';
import type { ReposicionClase } from '../../../types/reposicion';

import ReposicionesForm from './ReposicionesForm';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';

import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Datos de prueba
const mockTutores: TutorMini[] = [
  { id: 2, nombre: 'Laura Rodríguez' },
  { id: 3, nombre: 'Carlos Martínez' },
];

const mockAulas: Aula[] = [
  { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
  { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
  { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
];

const mockHorarios: Horario[] = [
  { id: 1, dia_sem: 'LU', hora_ini: '07:00', hora_fin: '07:45' },
  { id: 2, dia_sem: 'LU', hora_ini: '07:45', hora_fin: '08:30' },
  { id: 3, dia_sem: 'MI', hora_ini: '10:00', hora_fin: '10:50' },
];

const mockMotivos: Motivo[] = [
  { id: 1, descripcion: 'Enfermedad' },
  { id: 2, descripcion: 'Actividad institucional' },
  { id: 3, descripcion: 'Falla en servicio público' },
  { id: 4, descripcion: 'Otro' },
];

const mockReposiciones: ReposicionClase[] = [
  {
    id: 1,
    id_tutor: 2,
    id_aula: 1,
    id_horario: 1,
    fecha_original: '2025-02-10',
    fecha_reposicion: '2025-02-17',
    id_motivo: 2,
  },
];

const generateId = (items: { id: number }[]): number =>
  items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

const getNombreTutor = (tutores: TutorMini[], id: number): string =>
  tutores.find((t) => t.id === id)?.nombre ?? 'Desconocido';

const getEtiquetaAula = (aulas: Aula[], id: number): string => {
  const aula = aulas.find((a) => a.id === id);
  return aula ? `${aula.grado}°${aula.grupo} — Aula #${aula.id}` : 'Aula desconocida';
};

const getEtiquetaHorario = (horarios: Horario[], id: number): string => {
  const h = horarios.find((hh) => hh.id === id);
  const diasMap: Record<string, string> = {
    LU: 'Lunes',
    MA: 'Martes',
    MI: 'Miércoles',
    JU: 'Jueves',
    VI: 'Viernes',
    SA: 'Sábado',
  };
  return h ? `${diasMap[h.dia_sem]} • ${h.hora_ini} - ${h.hora_fin}` : 'Horario desconocido';
};

const getMotivoTexto = (motivos: Motivo[], id_motivo: number | null): string => {
  if (!id_motivo) return 'Sin motivo';
  return motivos.find((m) => m.id === id_motivo)?.descripcion ?? 'Sin motivo';
};

const hoyISO = (): string => new Date().toISOString().slice(0, 10);

const ReposicionesTab: React.FC = () => {
  const [tutores] = useState<TutorMini[]>(mockTutores);
  const [aulas] = useState<Aula[]>(mockAulas);
  const [horarios] = useState<Horario[]>(mockHorarios);
  const [motivos] = useState<Motivo[]>(mockMotivos);
  const [reposiciones, setReposiciones] = useState<ReposicionClase[]>(mockReposiciones);

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<ReposicionClase>>({
    id_tutor: tutores[0]?.id ?? 0,
    id_aula: aulas[0]?.id ?? 0,
    id_horario: horarios[0]?.id ?? 0,
    fecha_original: hoyISO(),
    fecha_reposicion: hoyISO(),
    id_motivo: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // filtrado de reposiciones segun búsqueda
  const reposicionesFiltradas = useMemo(
    () => {
      const termino = search.toLowerCase().trim();
      if (termino === '') return reposiciones;

      return reposiciones.filter((r) => {
        const tutor = getNombreTutor(tutores, r.id_tutor).toLowerCase();
        const aula = getEtiquetaAula(aulas, r.id_aula).toLowerCase();
        const horario = getEtiquetaHorario(horarios, r.id_horario).toLowerCase();
        return (
          tutor.includes(termino) ||
          aula.includes(termino) ||
          horario.includes(termino) ||
          r.fecha_original.includes(termino) ||
          r.fecha_reposicion.includes(termino)
        );
      });
    },
    [reposiciones, search, tutores, aulas, horarios]
  );

  const estadisticas = useMemo(
    () => {
      const hoy = hoyISO();
      return {
        totalReposiciones: reposiciones.length,
        proximasReposiciones: reposiciones.filter((r) => r.fecha_reposicion >= hoy).length,
        pasadasReposiciones: reposiciones.filter((r) => r.fecha_reposicion < hoy).length,
      };
    },
    [reposiciones]
  );

  // handlers de formulario
  const openCreateForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      id_tutor: tutores[0]?.id ?? 0,
      id_aula: aulas[0]?.id ?? 0,
      id_horario: horarios[0]?.id ?? 0,
      fecha_original: hoyISO(),
      fecha_reposicion: hoyISO(),
      id_motivo: null,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (repo: ReposicionClase) => {
    setIsEditing(true);
    setEditingId(repo.id);
    setFormData(repo);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormError(null);
    setEditingId(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'id_tutor' ||
        name === 'id_aula' ||
        name === 'id_horario' ||
        name === 'id_motivo'
          ? Number(value) === 0
            ? name === 'id_motivo'
              ? null
              : 0
            : Number(value)
          : value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.id_tutor || formData.id_tutor === 0) {
      return 'Debes seleccionar un tutor.';
    }
    if (!formData.id_aula || formData.id_aula === 0) {
      return 'Debes seleccionar un aula.';
    }
    if (!formData.id_horario || formData.id_horario === 0) {
      return 'Debes seleccionar un bloque de horario.';
    }
    if (!formData.fecha_original) {
      return 'Debes seleccionar la fecha original de la clase.';
    }
    if (!formData.fecha_reposicion) {
      return 'Debes seleccionar la nueva fecha de reposición.';
    }

    const fOriginal = new Date(formData.fecha_original).getTime();
    const fRepo = new Date(formData.fecha_reposicion).getTime();

    if (fRepo < fOriginal) {
      return 'La fecha de reposición no puede ser anterior a la fecha original.';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingId != null) {
        setReposiciones((prev) =>
          prev.map((r) =>
            r.id === editingId ? (formData as ReposicionClase) : r
          )
        );
      } else {
        const nuevoId = generateId(reposiciones);
        setReposiciones((prev) => [
          ...prev,
          {
            id: nuevoId,
            id_tutor: formData.id_tutor as number,
            id_aula: formData.id_aula as number,
            id_horario: formData.id_horario as number,
            fecha_original: formData.fecha_original as string,
            fecha_reposicion: formData.fecha_reposicion as string,
            id_motivo: (formData.id_motivo as number | null) ?? null,
          },
        ]);
      }
      closeForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta reposición?')) return;
    setReposiciones((prev) => prev.filter((r) => r.id !== id));
  };

  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Reposiciones de Clases
            </CardTitle>
            <CardDescription>
              Registro y gestión de clases reprogramadas por inasistencia
            </CardDescription>
          </div>
          <button
            onClick={openCreateForm}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-md transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Registrar reposición
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* tarjetas de estadísticas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-md transition-all">
            <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
              Total Reposiciones
            </div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {estadisticas.totalReposiciones}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition-all">
            <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">
              Próximas
            </div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {estadisticas.proximasReposiciones}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-500 hover:shadow-md transition-all">
            <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide">
              Pasadas
            </div>
            <div className="text-3xl font-bold text-orange-900 mt-2">
              {estadisticas.pasadasReposiciones}
            </div>
          </div>
        </div>

        {/* filtro de búsqueda */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por tutor, aula, horario o fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 text-sm"
            />
          </div>
        </div>

        {/* tabla */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Aula
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Fecha Original
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Reposición
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reposicionesFiltradas.length > 0 ? (
                  reposicionesFiltradas.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`transition-colors hover:bg-green-50 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          {getNombreTutor(tutores, r.id_tutor)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {getEtiquetaAula(aulas, r.id_aula)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          {getEtiquetaHorario(horarios, r.id_horario)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {r.fecha_original}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-700 font-semibold">
                        {r.fecha_reposicion}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                          {r.id_motivo ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              {getMotivoTexto(motivos, r.id_motivo)}
                            </>
                          ) : (
                            'Sin motivo'
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-center">
                          <button
                            type="button"
                            onClick={() => openEditForm(r)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-all hover:scale-110 duration-150"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-all hover:scale-110 duration-150"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-gray-500 italic text-sm"
                    >
                      {search
                        ? 'Sin reposiciones coincidentes'
                        : 'Sin reposiciones registradas'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      {isFormOpen && (
        <ReposicionesForm
          isEditing={isEditing}
          formData={formData}
          tutores={tutores}
          aulas={aulas}
          horarios={horarios}
          motivos={motivos}
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

export default ReposicionesTab;
