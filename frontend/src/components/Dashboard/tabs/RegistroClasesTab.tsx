import React, { useMemo, useState } from 'react';

import type { Personal } from '../../../types/personal';
import type { Aula } from '../../../types/aula';
import type { Horario } from '../../../types/horario';
import type { TutorAula, AulaHorario } from '../../../types/asignaciones';
import type {
  AsistenciaEstudiante,
  Motivo,
  Semana,
} from '../../../types/registroClases';
import type { Estudiante } from '../../../types/estudiante';

import RegistroClasesForm from './RegistroClasesForm';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';
import {
  Users,
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

type TutorFilter = number | 'none';

// Datos de prueba
const mockTutores: Personal[] = [
  {
    id: 2,
    nombres: 'Laura',
    apellidos: 'Rodríguez',
    correo: 'laura.rod@globalenglish.edu.co',
    telefono: '3002223344',
    tipo_doc: 1,
    num_doc: '1012345678',
    id_rol: 2,
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

const mockTutorAula: TutorAula[] = [
  { id: 1, id_aula: 1, id_tutor: 2, fecha_asignado: '2025-02-01', fecha_desasignado: null },
  { id: 2, id_aula: 3, id_tutor: 3, fecha_asignado: '2025-02-10', fecha_desasignado: null },
];

const mockAulaHorario: AulaHorario[] = [
  { id: 1, id_aula: 1, id_horario: 1 },
  { id: 2, id_aula: 1, id_horario: 2 },
  { id: 3, id_aula: 3, id_horario: 3 },
];

const mockEstudiantes: Estudiante[] = [
  {
    id: 1,
    nombres: 'Maria José',
    apellidos: 'Aroca Franco',
    tipo_doc: 2,
    num_doc: '200194043',
    id_aula: 1,
    score_in: 78,
    score_out: 85,
  },
  {
    id: 2,
    nombres: 'Ana',
    apellidos: 'García López',
    tipo_doc: 3,
    num_doc: '202000111',
    id_aula: 1,
    score_in: 82,
    score_out: 90,
  },
  {
    id: 3,
    nombres: 'Pepito',
    apellidos: 'Pérez Díaz',
    tipo_doc: 3,
    num_doc: '202000222',
    id_aula: 3,
    score_in: 70,
    score_out: 79,
  },
];

const mockMotivos: Motivo[] = [
  { id: 1, descripcion: 'Enfermedad' },
  { id: 2, descripcion: 'Actividad institucional' },
  { id: 3, descripcion: 'Transporte / movilidad' },
  { id: 4, descripcion: 'Reposición de clase' },
];

const mockSemanas: Semana[] = [
  { id: 1, fec_ini: '2025-02-10', fec_fin: '2025-02-14', id_periodo: 1 },
  { id: 2, fec_ini: '2025-02-17', fec_fin: '2025-02-21', id_periodo: 1 },
];

// Utilidades
const DIAS_LABEL: Record<string, string> = {
  LU: 'Lunes',
  MA: 'Martes',
  MI: 'Miércoles',
  JU: 'Jueves',
  VI: 'Viernes',
  SA: 'Sábado',
};

const findSemanaByFecha = (semanas: Semana[], fecha: string): Semana | null => {
  if (!fecha) return null;
  return semanas.find((s) => fecha >= s.fec_ini && fecha <= s.fec_fin) ?? null;
};

// Componente principal
const RegistroClasesTab: React.FC = () => {
  const [tutores] = useState<Personal[]>(mockTutores);
  const [aulas] = useState<Aula[]>(mockAulas);
  const [horarios] = useState<Horario[]>(mockHorarios);
  const [tutorAula] = useState<TutorAula[]>(mockTutorAula);
  const [aulaHorario] = useState<AulaHorario[]>(mockAulaHorario);
  const [estudiantes] = useState<Estudiante[]>(mockEstudiantes);
  const [motivos] = useState<Motivo[]>(mockMotivos);
  const [semanas] = useState<Semana[]>(mockSemanas);

  // Estado de sesión
  const [tutorActivoId, setTutorActivoId] = useState<TutorFilter>('none');
  const [aulaIdSeleccionada, setAulaIdSeleccionada] = useState<number | 0>(0);
  const [horarioIdSeleccionado, setHorarioIdSeleccionado] = useState<number | 0>(0);
  const [fecha, setFecha] = useState<string>('');
  const [searchEst, setSearchEst] = useState('');

  // Estado de asistencia
  const [asistenciaState, setAsistenciaState] = useState<{
    [idEstudiante: number]: { asistio: boolean; id_motivo: number | null };
  }>({});

  const [registros, setRegistros] = useState<AsistenciaEstudiante[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Datos derivados con useMemo para optimización
  const tutorActivo = useMemo(
    () => (tutorActivoId === 'none' ? null : tutores.find((t) => t.id === tutorActivoId) ?? null),
    [tutorActivoId, tutores],
  );

  const aulasDelTutor = useMemo(() => {
    if (!tutorActivo) return [];
    const idsAulas = tutorAula
      .filter((ta) => ta.id_tutor === tutorActivo.id && !ta.fecha_desasignado)
      .map((ta) => ta.id_aula);
    return aulas.filter((a) => idsAulas.includes(a.id));
  }, [tutorActivo, tutorAula, aulas]);

  const aulaSeleccionada = useMemo(
    () => (aulaIdSeleccionada === 0 ? null : aulas.find((a) => a.id === aulaIdSeleccionada) ?? null),
    [aulas, aulaIdSeleccionada],
  );

  const horariosDelAula = useMemo(() => {
    if (!aulaSeleccionada) return [];
    const idsHorarios = aulaHorario
      .filter((ah) => ah.id_aula === aulaSeleccionada.id)
      .map((ah) => ah.id_horario);
    return horarios.filter((h) => idsHorarios.includes(h.id));
  }, [aulaSeleccionada, aulaHorario, horarios]);

  const horarioSeleccionado = useMemo(
    () =>
      horarioIdSeleccionado === 0
        ? null
        : horarios.find((h) => h.id === horarioIdSeleccionado) ?? null,
    [horarios, horarioIdSeleccionado],
  );

  const semanaActual = useMemo(
    () => findSemanaByFecha(semanas, fecha),
    [semanas, fecha],
  );

  const estudiantesDelAula = useMemo(() => {
    const base = aulaSeleccionada
      ? estudiantes.filter((e) => e.id_aula === aulaSeleccionada.id)
      : [];

    if (!searchEst.trim()) return base;

    const termino = searchEst.toLowerCase().trim();
    return base.filter((e) =>
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(termino) ||
      e.num_doc.toLowerCase().includes(termino),
    );
  }, [estudiantes, aulaSeleccionada, searchEst]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const presentes = estudiantesDelAula.filter(
      (e) => (asistenciaState[e.id]?.asistio ?? true) === true,
    ).length;
    const ausentes = estudiantesDelAula.length - presentes;
    const porcentaje =
      estudiantesDelAula.length === 0 ? 0 : Math.round((presentes / estudiantesDelAula.length) * 100);

    return { presentes, ausentes, porcentaje };
  }, [estudiantesDelAula, asistenciaState]);

  // Handlers
  const resetSesion = () => {
    setAsistenciaState({});
    setSaveError(null);
  };

  const handleChangeTutor = (value: string) => {
    const newId = value === 'none' ? 'none' : Number(value);
    setTutorActivoId(newId as TutorFilter);
    setAulaIdSeleccionada(0);
    setHorarioIdSeleccionado(0);
    resetSesion();
  };

  const handleChangeAula = (value: string) => {
    setAulaIdSeleccionada(value === '0' ? 0 : Number(value));
    setHorarioIdSeleccionado(0);
    resetSesion();
  };

  const handleChangeHorario = (value: string) => {
    setHorarioIdSeleccionado(value === '0' ? 0 : Number(value));
    resetSesion();
  };

  const handleChangeFecha = (value: string) => {
    setFecha(value);
    resetSesion();
  };

  const handleToggleAsistencia = (idEst: number) => {
    setAsistenciaState((prev) => {
      const current = prev[idEst] ?? { asistio: true, id_motivo: null };
      return {
        ...prev,
        [idEst]: { ...current, asistio: !current.asistio },
      };
    });
  };

  const handleChangeMotivo = (idEst: number, idMotivo: number | null) => {
    setAsistenciaState((prev) => {
      const current = prev[idEst] ?? { asistio: true, id_motivo: null };
      return {
        ...prev,
        [idEst]: { ...current, id_motivo: idMotivo },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones
    if (!tutorActivo || !aulaSeleccionada || !horarioSeleccionado || !fecha) {
      setSaveError('Debes seleccionar tutor, aula, horario y fecha.');
      return;
    }

    if (estudiantesDelAula.length === 0) {
      setSaveError('No hay estudiantes en el aula seleccionada.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    const semana = semanaActual ?? semanas[0];

    const nuevos: AsistenciaEstudiante[] = estudiantesDelAula.map((e) => {
      const estado = asistenciaState[e.id] ?? { asistio: true, id_motivo: null };
      return {
        id: registros.length + Math.floor(Math.random() * 10000),
        fecha_real: fecha,
        asistio: estado.asistio,
        id_estudiante: e.id,
        id_aula: aulaSeleccionada.id,
        id_tutor: tutorActivo.id,
        id_horario: horarioSeleccionado.id,
        id_semana: semana?.id ?? 1,
        id_motivo: estado.id_motivo ?? null,
      };
    });

    // Simular guardado
    setTimeout(() => {
      setRegistros((prev) => [...prev, ...nuevos]);
      setIsSaving(false);
      resetSesion();
    }, 500);
  };

  // Render
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-green-600" />
              Registro de Clases
            </CardTitle>
            <CardDescription>
              Administrativo: selecciona tutor, aula, horario y fecha para registrar asistencia
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros de sesión */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tutor
              </label>
              <select
                value={tutorActivoId === 'none' ? 'none' : tutorActivoId}
                onChange={(e) => handleChangeTutor(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium transition-all hover:border-green-300"
              >
                <option value="none">Selecciona un tutor</option>
                {tutores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombres} {t.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aula
              </label>
              <select
                value={aulaIdSeleccionada || 0}
                onChange={(e) => handleChangeAula(e.target.value)}
                disabled={!tutorActivo}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium transition-all hover:border-green-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={0}>Selecciona un aula</option>
                {aulasDelTutor.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.grado}°{a.grupo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => handleChangeFecha(e.target.value)}
                disabled={!tutorActivo}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium transition-all hover:border-green-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Horario
              </label>
              <select
                value={horarioIdSeleccionado || 0}
                onChange={(e) => handleChangeHorario(e.target.value)}
                disabled={!aulaSeleccionada}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium transition-all hover:border-green-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={0}>Selecciona horario</option>
                {horariosDelAula.map((h) => (
                  <option key={h.id} value={h.id}>
                    {DIAS_LABEL[h.dia_sem]} {h.hora_ini}-{h.hora_fin}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar estudiante
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchEst}
                  onChange={(e) => setSearchEst(e.target.value)}
                  placeholder="Nombre, apellido o documento..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de asistencia */}
        <RegistroClasesForm
          fecha={fecha}
          semana={semanaActual}
          tutor={tutorActivo}
          aula={aulaSeleccionada}
          horario={horarioSeleccionado}
          estudiantes={estudiantesDelAula}
          motivos={motivos}
          asistencia={asistenciaState}
          isSaving={isSaving}
          error={saveError}
          onToggleAsistencia={handleToggleAsistencia}
          onChangeMotivo={handleChangeMotivo}
          onSubmit={handleSubmit}
        />

        {/* Estadísticas */}
        {estudiantesDelAula.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">Total Estudiantes</p>
                  <p className="text-3xl font-bold text-emerald-900">{estudiantesDelAula.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-sky-800" />
                </div>
                <div>
                  <p className="text-sm text-sky-600 font-semibold">Presentes</p>
                  <p className="text-3xl font-bold text-sky-900">{estadisticas.presentes}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-800" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-semibold">Ausentes ({estadisticas.porcentaje}%)</p>
                  <p className="text-3xl font-bold text-red-900">{estadisticas.ausentes}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistroClasesTab;
