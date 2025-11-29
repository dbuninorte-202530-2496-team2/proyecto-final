import React, { useMemo, useState } from 'react';

import type { Institucion } from '../../../types/institucion';
import type { Sede } from '../../../types/sede';
import type { Aula } from '../../../types/aula';
import type { Estudiante } from '../../../types/estudiante';
import type { AsistenciaEstudiante } from '../../../types/registroClases';
import type { Nota, Componente } from '../../../types/nota';
import type {
  ReporteAulaResumen,
  ReporteEstudianteAula,
} from '../../../types/reportes';

import ReportesDetalle from './ReportesDetalle';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';

import { Search, School, BarChart2, Users, TrendingUp } from 'lucide-react';

// Datos de prueba
const mockInstituciones: Institucion[] = [
  {
    id: 1,
    nombre: 'IED Simón Bolívar',
    correo: 'contacto@simonbolivar.edu.co',
    jornada: 'Mañana y Tarde',
    nombre_contacto: 'María González',
    telefono_contacto: '3001234567',
  },
  {
    id: 2,
    nombre: 'IED José Martí',
    correo: 'info@josemarti.edu.co',
    jornada: 'Única Mañana',
    nombre_contacto: 'Carlos Pérez',
    telefono_contacto: '3009876543',
  },
];

const mockSedes: Sede[] = [
  {
    id: 1,
    nombre: 'Sede Principal',
    direccion: 'Calle 50 #20-30, Barranquilla',
    id_inst: 1,
    is_principal: true,
  },
  {
    id: 2,
    nombre: 'Sede Norte',
    direccion: 'Carrera 45 #80-15, Barranquilla',
    id_inst: 1,
    is_principal: false,
  },
  {
    id: 3,
    nombre: 'Sede Principal',
    direccion: 'Carrera 38 #70-25, Barranquilla',
    id_inst: 2,
    is_principal: true,
  },
];

const mockAulas: Aula[] = [
  { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
  { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
  { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
  { id: 4, grado: 10, grupo: 'A', id_sede: 3 },
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
  {
    id: 4,
    nombres: 'María',
    apellidos: 'Santos Ruiz',
    tipo_doc: 3,
    num_doc: '202000333',
    id_aula: 4,
    score_in: 88,
    score_out: 92,
  },
];

// Asistencias ejemplo
const mockAsistencias: AsistenciaEstudiante[] = [
  // Aula 1
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

  // Aula 3
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

  // Aula 4
  {
    id: 6,
    fecha_real: '2025-02-10',
    asistio: true,
    id_estudiante: 4,
    id_aula: 4,
    id_tutor: 3,
    id_horario: 4,
    id_semana: 1,
    id_motivo: null,
  },
];

// Componentes y notas
const mockComponentes: Componente[] = [
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
  {
    id: 4,
    nombre: 'Outside – Presentación oral',
    tipo_programa: 'OUTSIDECLASSROOM',
    porcentaje: 60,
    id_periodo: 1,
  },
];

const mockNotas: Nota[] = [
  // Aula 1
  { id: 1, valor: 80, comentario: null, id_tutor: 2, id_comp: 1, id_estudiante: 1 },
  { id: 2, valor: 90, comentario: null, id_tutor: 2, id_comp: 2, id_estudiante: 1 },
  { id: 3, valor: 75, comentario: null, id_tutor: 2, id_comp: 1, id_estudiante: 2 },
  { id: 4, valor: 88, comentario: null, id_tutor: 2, id_comp: 2, id_estudiante: 2 },
  { id: 5, valor: 85, comentario: null, id_tutor: 2, id_comp: 3, id_estudiante: 1 },
  { id: 6, valor: 90, comentario: null, id_tutor: 2, id_comp: 4, id_estudiante: 1 },

  // Aula 3
  { id: 7, valor: 70, comentario: null, id_tutor: 3, id_comp: 1, id_estudiante: 3 },

  // Aula 4
  { id: 8, valor: 95, comentario: null, id_tutor: 3, id_comp: 1, id_estudiante: 4 },
  { id: 9, valor: 96, comentario: null, id_tutor: 3, id_comp: 2, id_estudiante: 4 },
];

// Types locales
type InstFilter = number | 'all';
type SedeFilter = number | 'all';
type AulaFilter = number | 'all';

// Helpers
const calcularPorcentajeAsistenciaEst = (
  asistencias: AsistenciaEstudiante[],
): number => {
  if (asistencias.length === 0) return 0;
  const presentes = asistencias.filter((a) => a.asistio).length;
  return (presentes / asistencias.length) * 100;
};

const calcularPromedioNotasPorPrograma = (
  notas: Nota[],
  componentes: Componente[],
  tipo_programa: 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM',
): number | null => {
  const idsComp = componentes
    .filter((c) => c.tipo_programa === tipo_programa)
    .map((c) => c.id);

  const filtradas = notas.filter((n) => idsComp.includes(n.id_comp));
  if (filtradas.length === 0) return null;

  const suma = filtradas.reduce((acc, n) => acc + n.valor, 0);
  return suma / filtradas.length;
};

// Componente principal
const ReportesTab: React.FC = () => {
  const [instituciones] = useState<Institucion[]>(mockInstituciones);
  const [sedes] = useState<Sede[]>(mockSedes);
  const [aulas] = useState<Aula[]>(mockAulas);
  const [estudiantes] = useState<Estudiante[]>(mockEstudiantes);
  const [asistencias] = useState<AsistenciaEstudiante[]>(mockAsistencias);
  const [notas] = useState<Nota[]>(mockNotas);
  const [componentes] = useState<Componente[]>(mockComponentes);

  const [instFilter, setInstFilter] = useState<InstFilter>('all');
  const [sedeFilter, setSedeFilter] = useState<SedeFilter>('all');
  const [aulaFilter, setAulaFilter] = useState<AulaFilter>('all');
  const [search, setSearch] = useState('');

  // Aulas filtradas
  const sedesFiltradas = useMemo(() => {
    if (instFilter === 'all') return sedes;
    return sedes.filter((s) => s.id_inst === instFilter);
  }, [sedes, instFilter]);

  const aulasFiltradas = useMemo(() => {
    return aulas.filter((a) => {
      const sede = sedes.find((s) => s.id === a.id_sede);
      const inst = instituciones.find((i) => i.id === sede?.id_inst);

      const coincideInst =
        instFilter === 'all' || inst?.id === instFilter;
      const coincideSede =
        sedeFilter === 'all' || sede?.id === sedeFilter;

      const termino = search.toLowerCase().trim();
      const etiquetaAula = `${a.grado}°${a.grupo}`;
      const nombreInst = inst?.nombre ?? '';
      const nombreSede = sede?.nombre ?? '';

      const coincideSearch =
        termino === '' ||
        etiquetaAula.toLowerCase().includes(termino) ||
        nombreInst.toLowerCase().includes(termino) ||
        nombreSede.toLowerCase().includes(termino);

      return coincideInst && coincideSede && coincideSearch;
    });
  }, [aulas, sedes, instituciones, instFilter, sedeFilter, search]);

  // Aula efectivamente seleccionada
  const aulaSeleccionada = useMemo(() => {
    if (aulasFiltradas.length === 0) return null;
    if (aulaFilter === 'all') return aulasFiltradas[0];
    return aulasFiltradas.find((a) => a.id === aulaFilter) ?? null;
  }, [aulasFiltradas, aulaFilter]);

  // Cálculo de reportes

  const reporteAula: ReporteAulaResumen | null =
    useMemo(() => {
      if (!aulaSeleccionada) return null;

      const sede = sedes.find((s) => s.id === aulaSeleccionada.id_sede);
      const inst = instituciones.find((i) => i.id === sede?.id_inst);

      const estAula = estudiantes.filter(
        (e) => e.id_aula === aulaSeleccionada.id,
      );
      const asistAula = asistencias.filter(
        (a) => a.id_aula === aulaSeleccionada.id,
      );
      const notasAula = notas.filter((n) =>
        estAula.some((e) => e.id === n.id_estudiante),
      );

      // asistencia promedio aula = promedio de % individuales
      const porcentajesEst = estAula.map((e) =>
        calcularPorcentajeAsistenciaEst(
          asistAula.filter((a) => a.id_estudiante === e.id),
        ),
      );
      const promedioAsistencia =
        porcentajesEst.length === 0
          ? 0
          : porcentajesEst.reduce((acc, v) => acc + v, 0) /
            porcentajesEst.length;

      const promedioInside = calcularPromedioNotasPorPrograma(
        notasAula,
        componentes,
        'INSIDECLASSROOM',
      );
      const promedioOutside = calcularPromedioNotasPorPrograma(
        notasAula,
        componentes,
        'OUTSIDECLASSROOM',
      );

      return {
        id_aula: aulaSeleccionada.id,
        nombre_aula: `${aulaSeleccionada.grado}°${aulaSeleccionada.grupo} — Aula #${aulaSeleccionada.id}`,
        institucion: inst?.nombre ?? 'Sin institución',
        sede: sede?.nombre ?? 'Sin sede',
        total_estudiantes: estAula.length,
        porcentaje_asistencia: promedioAsistencia,
        promedio_inside: promedioInside,
        promedio_outside: promedioOutside,
      };
    }, [
      aulaSeleccionada,
      sedes,
      instituciones,
      estudiantes,
      asistencias,
      notas,
      componentes,
    ]);

  const reporteEstudiantes: ReporteEstudianteAula[] =
    useMemo(() => {
      if (!aulaSeleccionada) return [];

      const estAula = estudiantes.filter(
        (e) => e.id_aula === aulaSeleccionada.id,
      );
      const asistAula = asistencias.filter(
        (a) => a.id_aula === aulaSeleccionada.id,
      );
      const notasAula = notas.filter((n) =>
        estAula.some((e) => e.id === n.id_estudiante),
      );

      return estAula.map<ReporteEstudianteAula>((e) => {
        const asistEst = asistAula.filter(
          (a) => a.id_estudiante === e.id,
        );
        const notasEst = notasAula.filter(
          (n) => n.id_estudiante === e.id,
        );

        const porcentajeAsis =
          calcularPorcentajeAsistenciaEst(asistEst);

        const promedioInside = calcularPromedioNotasPorPrograma(
          notasEst,
          componentes,
          'INSIDECLASSROOM',
        );
        const promedioOutside = calcularPromedioNotasPorPrograma(
          notasEst,
          componentes,
          'OUTSIDECLASSROOM',
        );

        return {
          id_estudiante: e.id,
          nombre_completo: `${e.nombres} ${e.apellidos}`,
          documento: e.num_doc,
          porcentaje_asistencia: porcentajeAsis,
          promedio_inside: promedioInside,
          promedio_outside: promedioOutside,
        };
      });
    }, [
      aulaSeleccionada,
      estudiantes,
      asistencias,
      notas,
      componentes,
    ]);

  // Stats generales para arriba

  const totalAulasVista = aulasFiltradas.length;
  const totalEstudiantesVista = estudiantes.filter((e) =>
    aulasFiltradas.some((a) => a.id === e.id_aula),
  ).length;

  const asistenciaPromedioVista = useMemo(() => {
    if (aulasFiltradas.length === 0) return 0;

    const porcentajesPorAula = aulasFiltradas.map((aula) => {
      const estAula = estudiantes.filter(
        (e) => e.id_aula === aula.id,
      );
      const asistAula = asistencias.filter(
        (a) => a.id_aula === aula.id,
      );

      const porcentajesEst = estAula.map((e) =>
        calcularPorcentajeAsistenciaEst(
          asistAula.filter((a) => a.id_estudiante === e.id),
        ),
      );

      if (porcentajesEst.length === 0) return 0;

      return (
        porcentajesEst.reduce((acc, v) => acc + v, 0) /
        porcentajesEst.length
      );
    });

    return (
      porcentajesPorAula.reduce((acc, v) => acc + v, 0) /
      porcentajesPorAula.length
    );
  }, [aulasFiltradas, estudiantes, asistencias]);

  // RENDER
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-green-600" />
              Reportes de Desempeño
            </CardTitle>
            <CardDescription>
              Análisis integral de asistencia y desempeño académico por institución, sede y aula
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* ESTADÍSTICAS GENERALES - Sección de resumen */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          {/* Aulas en vista */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                <School className="w-6 h-6 text-emerald-800" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 font-semibold">Aulas en Vista</p>
                <p className="text-3xl font-bold text-emerald-900">{totalAulasVista}</p>
              </div>
            </div>
          </div>

          {/* Estudiantes en vista */}
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-sky-800" />
              </div>
              <div>
                <p className="text-sm text-sky-700 font-semibold">Estudiantes en Vista</p>
                <p className="text-3xl font-bold text-sky-900">{totalEstudiantesVista}</p>
              </div>
            </div>
          </div>

          {/* Asistencia promedio */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-800" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-semibold">Asistencia Promedio</p>
                <p className="text-3xl font-bold text-green-900">{asistenciaPromedioVista.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Institución
              </label>
              <select
                value={instFilter === 'all' ? 'all' : instFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setInstFilter(v === 'all' ? 'all' : Number(v));
                  setSedeFilter('all');
                  setAulaFilter('all');
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all"
              >
                <option value="all">Todas las instituciones</option>
                {instituciones.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sede */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sede
              </label>
              <select
                value={sedeFilter === 'all' ? 'all' : sedeFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setSedeFilter(v === 'all' ? 'all' : Number(v));
                  setAulaFilter('all');
                }}
                disabled={instFilter === 'all'}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="all">Todas las sedes</option>
                {sedesFiltradas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Aula */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aula
              </label>
              <select
                value={aulaFilter === 'all' ? 'all' : aulaFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setAulaFilter(v === 'all' ? 'all' : Number(v));
                }}
                disabled={sedeFilter === 'all'}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="all">Selecciona aula o primero</option>
                {aulasFiltradas.map((a) => (
                  <option key={a.id} value={a.id}>
                    Grado {a.grado}°{a.grupo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar Aula, Institución o Sede
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej: 4A, Simón Bolívar, Sede Norte..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-300 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="animate-fadeIn">
          <ReportesDetalle
            aulaResumen={reporteAula}
            estudiantesDetalle={reporteEstudiantes}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportesTab;
