import React, { useMemo, useState } from 'react';

import type { Aula } from '../../../types/aula';
import type { Horario } from '../../../types/horario';
import type { AsistenciaEstudiante } from '../../../types/registroClases';
import type {
  ClaseProgramada,
  SupervisionResumenTutor,
  SupervisionDetalleClase,
} from '../../../types/supervision';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';

import { UserCheck, Search, CalendarRange } from 'lucide-react';
import SupervisionDetalle from './SupervisionDetalle';

interface Tutor {
  id: number;
  nombre: string;
}

// Datos de prueba
const mockTutores: Tutor[] = [
  { id: 2, nombre: 'Laura Martínez' },
  { id: 3, nombre: 'Juan Pérez' },
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

// Clases programadas para los tutores 
const mockProgramaciones: ClaseProgramada[] = [
  {
    id: 1,
    id_tutor: 2,
    id_aula: 1,
    id_horario: 1,
    fecha_programada: '2025-02-10',
  },
  {
    id: 2,
    id_tutor: 2,
    id_aula: 1,
    id_horario: 1,
    fecha_programada: '2025-02-17',
  },
  {
    id: 3,
    id_tutor: 3,
    id_aula: 3,
    id_horario: 3,
    fecha_programada: '2025-02-10',
  },
];

// Asistencias de estudiantes 
const mockAsistencias: AsistenciaEstudiante[] = [
  {
    id: 1,
    fecha_real: '2025-02-10',
    asistio: true,
    id_estudiante: 1,
    id_aula: 1,
    id_tutor: 2,
    id_horario: 1,
    id_semana: 1,
    id_motivo: null,
  },
  {
    id: 2,
    fecha_real: '2025-02-10',
    asistio: false,
    id_estudiante: 2,
    id_aula: 1,
    id_tutor: 2,
    id_horario: 1,
    id_semana: 1,
    id_motivo: 1,
  },
  {
    id: 3,
    fecha_real: '2025-02-17',
    asistio: true,
    id_estudiante: 1,
    id_aula: 1,
    id_tutor: 2,
    id_horario: 1,
    id_semana: 2,
    id_motivo: null,
  },
  {
    id: 4,
    fecha_real: '2025-02-17',
    asistio: true,
    id_estudiante: 2,
    id_aula: 1,
    id_tutor: 2,
    id_horario: 1,
    id_semana: 2,
    id_motivo: null,
  },
  {
    id: 5,
    fecha_real: '2025-02-10',
    asistio: true,
    id_estudiante: 3,
    id_aula: 3,
    id_tutor: 3,
    id_horario: 3,
    id_semana: 1,
    id_motivo: null,
  },
];

const getNombreTutor = (tutores: Tutor[], id: number) =>
  tutores.find((t) => t.id === id)?.nombre ?? 'Desconocido';

const getEtiquetaAula = (aulas: Aula[], id: number) => {
  const aula = aulas.find((a) => a.id === id);
  if (!aula) return 'Aula desconocida';
  return `${aula.grado}°${aula.grupo} — Aula #${aula.id}`;
};

const getEtiquetaHorario = (horarios: Horario[], id: number) => {
  const h = horarios.find((hh) => hh.id === id);
  if (!h) return 'Horario desconocido';
  const diasMap: Record<string, string> = {
    LU: 'Lunes',
    MA: 'Martes',
    MI: 'Miércoles',
    JU: 'Jueves',
    VI: 'Viernes',
    SA: 'Sábado',
  };
  const dia = diasMap[h.dia_sem] ?? h.dia_sem;
  return `${dia} • ${h.hora_ini} - ${h.hora_fin}`;
};

const filtrarPorRango = (
  programaciones: ClaseProgramada[],
  fechaDesde: string,
  fechaHasta: string,
): ClaseProgramada[] => {
  if (!fechaDesde && !fechaHasta) return programaciones;

  let desde: number | null = null;
  let hasta: number | null = null;

  if (fechaDesde) desde = new Date(fechaDesde).getTime();
  if (fechaHasta) hasta = new Date(fechaHasta).getTime();

  if (desde !== null && hasta !== null && desde > hasta) {
    const tmp = desde;
    desde = hasta;
    hasta = tmp;
  }

  return programaciones.filter((p) => {
    const t = new Date(p.fecha_programada).getTime();
    if (desde !== null && t < desde) return false;
    if (hasta !== null && t > hasta) return false;
    return true;
  });
};

const calcularPorcentajeAsistenciaEstudiantes = (
  asistencias: AsistenciaEstudiante[],
): number | null => {
  if (asistencias.length === 0) return null;
  const presentes = asistencias.filter((a) => a.asistio).length;
  return (presentes / asistencias.length) * 100;
};

const SupervisionTab: React.FC = () => {
  const [tutores] = useState<Tutor[]>(mockTutores);
  const [aulas] = useState<Aula[]>(mockAulas);
  const [horarios] = useState<Horario[]>(mockHorarios);
  const [programaciones] = useState<ClaseProgramada[]>(mockProgramaciones);
  const [asistencias] = useState<AsistenciaEstudiante[]>(mockAsistencias);

  const [tutorSeleccionadoId, setTutorSeleccionadoId] = useState<number | 0>(
    0,
  );
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [errorFechas, setErrorFechas] = useState<string | null>(null);

  // Validar que fechaHasta >= fechaDesde
  const validarFechas = (desde: string, hasta: string) => {
    if (!desde || !hasta) {
      setErrorFechas(null);
      return true;
    }
    const desdeTime = new Date(desde).getTime();
    const hastaTime = new Date(hasta).getTime();
    if (hastaTime <= desdeTime) {
      setErrorFechas('La fecha "Hasta" debe ser posterior a la fecha "Desde"');
      return false;
    }
    setErrorFechas(null);
    return true;
  };

  const handleChangeFechaDesde = (value: string) => {
    setFechaDesde(value);
    validarFechas(value, fechaHasta);
  };

  const handleChangeFechaHasta = (value: string) => {
    setFechaHasta(value);
    validarFechas(fechaDesde, value);
  };

  // Programaciones filtradas por tutor + rango 
  const programacionesFiltradas = useMemo(() => {
    if (!tutorSeleccionadoId) return [];
    // Si hay error de rango de fechas no devolvemos resultados 
    if (errorFechas) return [];
    const delTutor = programaciones.filter(
      (p) => p.id_tutor === tutorSeleccionadoId,
    );
    const porRango = filtrarPorRango(delTutor, fechaDesde, fechaHasta);

    if (!search.trim()) return porRango;

    const term = search.toLowerCase().trim();
    return porRango.filter((p) => {
      const etiquetaAula = getEtiquetaAula(aulas, p.id_aula).toLowerCase();
      const etiquetaHorario = getEtiquetaHorario(
        horarios,
        p.id_horario,
      ).toLowerCase();
      return (
        etiquetaAula.includes(term) ||
        etiquetaHorario.includes(term) ||
        p.fecha_programada.includes(term)
      );
    });
  }, [
    aulas,
    horarios,
    programaciones,
    tutorSeleccionadoId,
    fechaDesde,
    fechaHasta,
    search,
    errorFechas,
  ]);

  // Construir detalle por clase
  const detalleClases: SupervisionDetalleClase[] = useMemo(() => {
    if (!tutorSeleccionadoId) return [];

    return programacionesFiltradas.map<SupervisionDetalleClase>((p) => {
      const asistClase = asistencias.filter(
        (a) =>
          a.id_tutor === p.id_tutor &&
          a.id_aula === p.id_aula &&
          a.id_horario === p.id_horario &&
          a.fecha_real === p.fecha_programada,
      );

      const porcentaje =
        calcularPorcentajeAsistenciaEstudiantes(asistClase);

      return {
        id_programacion: p.id,
        fecha_programada: p.fecha_programada,
        aula: getEtiquetaAula(aulas, p.id_aula),
        horario: getEtiquetaHorario(horarios, p.id_horario),
        registro_asistencia:
          asistClase.length > 0 ? 'CON_REGISTRO' : 'SIN_REGISTRO',
        porcentaje_asistencia_estudiantes: porcentaje,
      };
    });
  }, [programacionesFiltradas, asistencias, aulas, horarios, tutorSeleccionadoId]);

  // Resumen por tutor
  const resumenTutor: SupervisionResumenTutor | null = useMemo(() => {
    if (!tutorSeleccionadoId) return null;

    const total_programadas = programacionesFiltradas.length;
    if (total_programadas === 0) {
      return {
        id_tutor: tutorSeleccionadoId,
        nombre_tutor: getNombreTutor(tutores, tutorSeleccionadoId),
        total_programadas: 0,
        total_con_asistencia: 0,
        cumplimiento: 0,
      };
    }

    const total_con_asistencia = detalleClases.filter(
      (c) => c.registro_asistencia === 'CON_REGISTRO',
    ).length;

    const cumplimiento =
      (total_con_asistencia / total_programadas) * 100;

    return {
      id_tutor: tutorSeleccionadoId,
      nombre_tutor: getNombreTutor(tutores, tutorSeleccionadoId),
      total_programadas,
      total_con_asistencia,
      cumplimiento,
    };
  }, [tutorSeleccionadoId, programacionesFiltradas, detalleClases, tutores]);

  return (
    <Card>
      <CardHeader className="animate-fadeIn">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-green-600" />
              Supervisión de Tutores
            </CardTitle>
            <CardDescription>
              Verifica si el tutor está registrando asistencia en las clases
              que tiene programadas, por rango de fechas.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Tutor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tutor
              </label>
              <select
                value={tutorSeleccionadoId}
                onChange={(e) => setTutorSeleccionadoId(Number(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all"
              >
                <option value={0}>Selecciona un tutor</option>
                {tutores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Desde */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => handleChangeFechaDesde(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
              />
            </div>

            {/* Hasta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => handleChangeFechaHasta(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition-all ${
                  errorFechas
                    ? 'border-red-400 focus:border-red-600 focus:ring-red-600 bg-red-50'
                    : 'border-gray-300 focus:border-green-600'
                }`}
              />
            </div>
          </div>

          {/* Error de validación */}
          {errorFechas && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3 animate-fadeIn">
              <div className="text-red-600 font-semibold text-sm">⚠️ {errorFechas}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1.5fr,auto] gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar por aula, horario o fecha
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ej: 4A, lunes, 2025-02-10..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-300 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setFechaDesde('');
                  setFechaHasta('');
                  setErrorFechas(null);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-100"
              >
                <CalendarRange className="w-4 h-4" />
                Limpiar rango de fechas
              </button>
              <p className="text-[11px] text-gray-500">
                Se supervisan únicamente las clases programadas del tutor en el
                rango seleccionado.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas resumen */}
        {resumenTutor && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border-l-4 border-emerald-500 hover:shadow-md transition-all">
              <div className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">Programadas</div>
              <div className="text-2xl font-bold text-emerald-900 mt-2">{resumenTutor.total_programadas}</div>
              <div className="text-xs text-gray-500 mt-1">Clases programadas en rango</div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 border-l-4 border-sky-500 hover:shadow-md transition-all">
              <div className="text-sky-600 text-sm font-semibold uppercase tracking-wide">Con registro</div>
              <div className="text-2xl font-bold text-sky-900 mt-2">{resumenTutor.total_con_asistencia}</div>
              <div className="text-xs text-gray-500 mt-1">Clases con registro de asistencia</div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border-l-4 border-violet-500 hover:shadow-md transition-all">
              <div className="text-violet-600 text-sm font-semibold uppercase tracking-wide">Cumplimiento</div>
              <div className="text-2xl font-bold text-violet-900 mt-2">{Math.round(resumenTutor.cumplimiento)}%</div>
              <div className="text-xs text-gray-500 mt-1">Porcentaje de cumplimiento</div>
            </div>
          </div>
        )}

        {/* Detalle */}
        <SupervisionDetalle
          resumen={resumenTutor}
          clases={detalleClases}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
        />
      </CardContent>
    </Card>
  );
};

export default SupervisionTab;
