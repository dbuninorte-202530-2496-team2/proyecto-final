// src/components/Dashboard/tabs/AsignacionesTab.tsx
import React, { useMemo, useState } from 'react';
import type { Aula } from '../../../types/aula';
import type { Personal } from '../../../types/personal';
import type { Horario } from '../../../types/horario';
import type { TutorAula, AulaHorario } from '../../../types/asignaciones';

import AsignacionesForm, {
  type AsignacionMode,
} from './AsignacionesForm';

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
  Users,
  BookOpen,
  Clock3,
  CalendarDays,
  Edit2,
  Trash2,
} from 'lucide-react';

/* ---------- Helpers ---------- */

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
  return h2 * 60 + m2 - (h1 * 60 + m1);
};

/* ---------- MOCK DATA ---------- */

const MOCK_AULAS: Aula[] = [
  { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
  { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
  { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
  { id: 4, grado: 10, grupo: 'A', id_sede: 3 },
];

const MOCK_TUTORES: Personal[] = [
  {
    id: 2,
    nombres: 'Laura',
    apellidos: 'Rodríguez',
    correo: 'laura.rod@globalenglish.edu.co',
    telefono: '3002223344',
    tipo_doc: 1,
    num_doc: '1012345678',
    id_rol: 2, // TUTOR
  },
  {
    id: 3,
    nombres: 'Carlos',
    apellidos: 'Martínez',
    correo: 'carlos.mtz@globalenglish.edu.co',
    telefono: '3003334455',
    tipo_doc: 1,
    num_doc: '1009876543',
    id_rol: 2,
  },
];

const MOCK_HORARIOS: Horario[] = [
  { id: 1, dia_sem: 'LU', hora_ini: '07:00', hora_fin: '07:45' },
  { id: 2, dia_sem: 'LU', hora_ini: '07:45', hora_fin: '08:30' },
  { id: 3, dia_sem: 'MI', hora_ini: '10:00', hora_fin: '10:50' },
  { id: 4, dia_sem: 'SA', hora_ini: '08:00', hora_fin: '08:45' },
];

// Relación tutor ↔ aula
const MOCK_TUTOR_AULAS: TutorAula[] = [
  {
    id: 1,
    id_aula: 1,
    id_tutor: 2,
    fecha_asignado: '2025-02-01',
    fecha_desasignado: null,
  },
  {
    id: 2,
    id_aula: 3,
    id_tutor: 3,
    fecha_asignado: '2025-02-15',
    fecha_desasignado: null,
  },
];

// Relación aula ↔ horario
const MOCK_AULA_HORARIOS: AulaHorario[] = [
  { id: 1, id_aula: 1, id_horario: 1 },
  { id: 2, id_aula: 1, id_horario: 2 },
  { id: 3, id_aula: 3, id_horario: 3 },
  { id: 4, id_aula: 4, id_horario: 4 },
];

const AsignacionesTab: React.FC = () => {
  const [aulas] = useState<Aula[]>(MOCK_AULAS);
  const [tutores] = useState<Personal[]>(MOCK_TUTORES);
  const [horarios] = useState<Horario[]>(MOCK_HORARIOS);

  const [tutorAulas, setTutorAulas] =
    useState<TutorAula[]>(MOCK_TUTOR_AULAS);
  const [aulaHorarios, setAulaHorarios] =
    useState<AulaHorario[]>(MOCK_AULA_HORARIOS);

  const [searchTutorAula, setSearchTutorAula] = useState('');
  const [searchAulaHorario, setSearchAulaHorario] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<AsignacionMode>('tutor_aula');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<
    Partial<TutorAula & AulaHorario>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- FILTROS ---------- */

  const tutorAulasFiltrado = useMemo(() => {
    return tutorAulas.filter((asig) => {
      const aula = aulas.find((a) => a.id === asig.id_aula);
      const tutor = tutores.find((t) => t.id === asig.id_tutor);

      const termino = searchTutorAula.toLowerCase().trim();
      if (!termino) return true;

      const str =
        `${aula?.grado ?? ''}${aula?.grupo ?? ''} ` +
        `${tutor?.nombres ?? ''} ${tutor?.apellidos ?? ''} ` +
        `${asig.fecha_asignado}`;

      return str.toLowerCase().includes(termino);
    });
  }, [tutorAulas, aulas, tutores, searchTutorAula]);

  const aulaHorariosFiltrado = useMemo(() => {
    return aulaHorarios.filter((asig) => {
      const aula = aulas.find((a) => a.id === asig.id_aula);
      const horario = horarios.find((h) => h.id === asig.id_horario);

      const termino = searchAulaHorario.toLowerCase().trim();
      if (!termino) return true;

      const str =
        `${aula?.grado ?? ''}${aula?.grupo ?? ''} ` +
        `${DIAS_LABEL[horario?.dia_sem ?? ''] ?? ''} ` +
        `${horario?.hora_ini ?? ''}`;

      return str.toLowerCase().includes(termino);
    });
  }, [aulaHorarios, aulas, horarios, searchAulaHorario]);

  /* ---------- FORM LÓGICA ---------- */

  const openCreateForm = (mode: AsignacionMode) => {
    setFormMode(mode);
    setIsEditing(false);
    setFormError(null);

    setFormData(
      mode === 'tutor_aula'
        ? {
            id_aula: 0,
            id_tutor: 0,
            fecha_asignado: new Date().toISOString().slice(0, 10),
            fecha_desasignado: '',
          }
        : {
            id_aula: 0,
            id_horario: 0,
          },
    );

    setIsFormOpen(true);
  };

  const openEditFormTutorAula = (asig: TutorAula) => {
    setFormMode('tutor_aula');
    setIsEditing(true);
    setFormError(null);
    setFormData(asig);
    setIsFormOpen(true);
  };

  const openEditFormAulaHorario = (asig: AulaHorario) => {
    setFormMode('aula_horario');
    setIsEditing(true);
    setFormError(null);
    setFormData(asig);
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

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'id_aula' ||
        name === 'id_tutor' ||
        name === 'id_horario'
          ? Number(value)
          : value,
    }));
  };

  const validateForm = () => {
    if (!formData.id_aula || formData.id_aula === 0) {
      return 'Debes seleccionar un aula.';
    }

    if (formMode === 'tutor_aula') {
      if (!formData.id_tutor || formData.id_tutor === 0) {
        return 'Debes seleccionar un tutor.';
      }
      if (!formData.fecha_asignado) {
        return 'La fecha de asignación es obligatoria.';
      }
    } else {
      if (!formData.id_horario || formData.id_horario === 0) {
        return 'Debes seleccionar un bloque de horario.';
      }
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

    if (formMode === 'tutor_aula') {
      const payload: TutorAula = {
        id: formData.id ?? -1,
        id_aula: formData.id_aula as number,
        id_tutor: formData.id_tutor as number,
        fecha_asignado: formData.fecha_asignado as string,
        fecha_desasignado:
          formData.fecha_desasignado === ''
            ? null
            : (formData.fecha_desasignado as string),
      };

      if (isEditing && formData.id != null) {
        setTutorAulas((prev) =>
          prev.map((a) => (a.id === formData.id ? payload : a)),
        );
      } else {
        const newId =
          tutorAulas.length > 0
            ? Math.max(...tutorAulas.map((a) => a.id)) + 1
            : 1;
        payload.id = newId;
        setTutorAulas((prev) => [...prev, payload]);
      }
    } else {
      const payload: AulaHorario = {
        id: formData.id ?? -1,
        id_aula: formData.id_aula as number,
        id_horario: formData.id_horario as number,
      };

      if (isEditing && formData.id != null) {
        setAulaHorarios((prev) =>
          prev.map((a) => (a.id === formData.id ? payload : a)),
        );
      } else {
        const newId =
          aulaHorarios.length > 0
            ? Math.max(...aulaHorarios.map((a) => a.id)) + 1
            : 1;
        payload.id = newId;
        setAulaHorarios((prev) => [...prev, payload]);
      }
    }

    setIsSubmitting(false);
    closeForm();
  };

  const handleDeleteTutorAula = (id: number) => {
    if (!window.confirm('¿Eliminar esta asignación Tutor ↔ Aula?')) return;
    setTutorAulas((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDeleteAulaHorario = (id: number) => {
    if (!window.confirm('¿Eliminar esta asignación Aula ↔ Horario?')) return;
    setAulaHorarios((prev) => prev.filter((a) => a.id !== id));
  };

  /* ---------- RESÚMENES ---------- */

  const totalTutorAulas = tutorAulas.length;
  const totalAulaHorarios = aulaHorarios.length;

  const aulasConTutor = new Set(tutorAulas.map((a) => a.id_aula)).size;
  const aulasConHorario = new Set(aulaHorarios.map((a) => a.id_aula)).size;

  /* ---------- RENDER ---------- */

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              Asignaciones
            </CardTitle>
            <CardDescription>
              Relaciona tutores, aulas y bloques de horario del programa.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* ---------- Sección Tutor ↔ Aula ---------- */}
        <section className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Users className="w-5 h-5 text-green-600" />
              Asignación Tutor ↔ Aula
            </h3>
            <button
              onClick={() => openCreateForm('tutor_aula')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva asignación
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por aula, tutor o fecha..."
              value={searchTutorAula}
              onChange={(e) => setSearchTutorAula(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm"
            />
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Aula
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Fecha asignación
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {tutorAulasFiltrado.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 text-sm italic"
                    >
                      No hay asignaciones Tutor ↔ Aula con ese criterio.
                    </td>
                  </tr>
                ) : (
                  tutorAulasFiltrado.map((asig) => {
                    const aula = aulas.find(
                      (a) => a.id === asig.id_aula,
                    );
                    const tutor = tutores.find(
                      (t) => t.id === asig.id_tutor,
                    );
                    const activa = !asig.fecha_desasignado;

                    return (
                      <tr
                        key={asig.id}
                        className="hover:bg-green-50 transition-colors"
                      >
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold">
                            Aula {aula?.grado}°{aula?.grupo} (#{aula?.id})
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {tutor
                            ? `${tutor.nombres} ${tutor.apellidos}`
                            : '—'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {asig.fecha_asignado}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              activa
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {activa ? 'Activa' : 'Finalizada'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditFormTutorAula(asig)}
                              className="p-2 hover:bg-amber-100 rounded-lg transition-all text-amber-600 hover:text-amber-700"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTutorAula(asig.id)
                              }
                              className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600 hover:text-red-700"
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
        </section>

        {/* ---------- Sección Aula ↔ Horario ---------- */}
        <section className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Clock3 className="w-5 h-5 text-green-600" />
              Asignación Aula ↔ Horario
            </h3>
            <button
              onClick={() => openCreateForm('aula_horario')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva asignación
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por aula, día u hora..."
              value={searchAulaHorario}
              onChange={(e) => setSearchAulaHorario(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm"
            />
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Aula
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Día
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Hora inicio
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Hora fin
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-green-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {aulaHorariosFiltrado.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 text-sm italic"
                    >
                      No hay asignaciones Aula ↔ Horario con ese criterio.
                    </td>
                  </tr>
                ) : (
                  aulaHorariosFiltrado.map((asig) => {
                    const aula = aulas.find(
                      (a) => a.id === asig.id_aula,
                    );
                    const horario = horarios.find(
                      (h) => h.id === asig.id_horario,
                    );
                    const mins = horario
                      ? duracionMinutos(
                          horario.hora_ini,
                          horario.hora_fin,
                        )
                      : 0;

                    return (
                      <tr
                        key={asig.id}
                        className="hover:bg-green-50 transition-colors"
                      >
                        <td className="px-4 py-2 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold">
                            Aula {aula?.grado}°{aula?.grupo} (#{aula?.id})
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                            <CalendarDays className="w-3 h-3" />
                            {horario
                              ? DIAS_LABEL[horario.dia_sem]
                              : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">
                          {horario?.hora_ini ?? '—'}
                        </td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">
                          {horario?.hora_fin ?? '—'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {horario && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                              {mins} min
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                openEditFormAulaHorario(asig)
                              }
                              className="p-2 hover:bg-amber-100 rounded-lg transition-all text-amber-600 hover:text-amber-700"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAulaHorario(asig.id)
                              }
                              className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600 hover:text-red-700"
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
        </section>

        {/* ---------- Resumen general ---------- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-semibold">
                  Asignaciones Tutor ↔ Aula
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {totalTutorAulas}
                </p>
                <p className="text-xs text-emerald-700">
                  {aulasConTutor} aulas con tutor asignado
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-sky-700" />
              </div>
              <div>
                <p className="text-sm text-sky-600 font-semibold">
                  Asignaciones Aula ↔ Horario
                </p>
                <p className="text-2xl font-bold text-sky-900">
                  {totalAulaHorarios}
                </p>
                <p className="text-xs text-sky-700">
                  {aulasConHorario} aulas con horario asignado
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-semibold">
                  Aulas del programa
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {aulas.length}
                </p>
                <p className="text-xs text-yellow-700">
                  Gestión centralizada de tutores y horarios
                </p>
              </div>
            </div>
          </div>
        </section>
      </CardContent>

      {isFormOpen && (
        <AsignacionesForm
          mode={formMode}
          isEditing={isEditing}
          formData={formData}
          aulas={aulas}
          tutores={tutores}
          horarios={horarios}
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

export default AsignacionesTab;
