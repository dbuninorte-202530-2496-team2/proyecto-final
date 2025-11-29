import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';

export function ReportesTab() {
  const { usuario, rol } = useAuth();

  if (!usuario || !rol) return null;

  const esTutor = rol === 'TUTOR';

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // Simulación de asistencias reales de la API
  const asistencias = [
    { fecha: '2024-01-10', estado: 'Asistió' },
    { fecha: '2024-01-12', estado: 'Asistió' },
    { fecha: '2024-01-15', estado: 'No asistió', motivo: 'Festivo' },
    { fecha: '2024-02-01', estado: 'Asistió' },
    { fecha: '2024-02-20', estado: 'No asistió', motivo: 'Permiso personal' },
    { fecha: '2024-03-02', estado: 'Asistió' }
  ];
=======
import { Search, School, BarChart2, Users, TrendingUp, Calendar } from 'lucide-react';
>>>>>>> Stashed changes
=======
import { Search, School, BarChart2, Users, TrendingUp, Calendar } from 'lucide-react';
>>>>>>> Stashed changes

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporteFiltrado, setReporteFiltrado] = useState<any[]>([]);

  const handleFiltrar = () => {
  if (!fechaInicio || !fechaFin) {
    alert("Selecciona ambas fechas");
    return;
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (fin < inicio) {
    alert("La fecha final no puede ser menor que la fecha inicial.");
    return;
  }

  const filtrado = asistencias.filter(a => {
    const fecha = new Date(a.fecha);
    return fecha >= inicio && fecha <= fin;
  });

  setReporteFiltrado(filtrado);
};

<<<<<<< Updated upstream
=======
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

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [errorFecha, setErrorFecha] = useState<string>('');

  // Validar rango de fechas
  const validarFechas = (inicio: string, fin: string): string => {
    if (!inicio && !fin) return '';
    if (inicio && fin && inicio > fin) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin';
    }
    return '';
  };

  // Manejar cambio de fecha inicio
  const handleFechaInicioChange = (fecha: string) => {
    setFechaInicio(fecha);
    const error = validarFechas(fecha, fechaFin);
    setErrorFecha(error);
  };

  // Manejar cambio de fecha fin
  const handleFechaFinChange = (fecha: string) => {
    setFechaFin(fecha);
    const error = validarFechas(fechaInicio, fecha);
    setErrorFecha(error);
  };

  // Filtrar asistencias por rango de fechas
  const asistenciasFiltradas = useMemo(() => {
    if (errorFecha) return asistencias;
    if (!fechaInicio && !fechaFin) return asistencias;
    return asistencias.filter((a) => {
      const fechaAsistencia = a.fecha_real;
      if (fechaInicio && fechaAsistencia < fechaInicio) return false;
      if (fechaFin && fechaAsistencia > fechaFin) return false;
      return true;
    });
  }, [asistencias, fechaInicio, fechaFin, errorFecha]);

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
      const asistAula = asistenciasFiltradas.filter(
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
      const asistAula = asistenciasFiltradas.filter(
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
      const asistAula = asistenciasFiltradas.filter(
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
>>>>>>> Stashed changes
  return (
    <div className="space-y-6">

      {/* Reporte general */}
      {esTutor && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Asistencia por Rango de Fechas</CardTitle>
            <CardDescription>
              Consulta tus asistencias dentro de un periodo específico.
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleFiltrar}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Generar Reporte
                </button>
              </div>
            </div>

            {/* Resultados */}
            {reporteFiltrado.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Resultados:</h3>

                {reporteFiltrado.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.fecha}</span>
                      <span className={item.estado === "Asistió" ? "text-green-600" : "text-red-600"}>
                        {item.estado}
                      </span>
                    </div>

                    {item.motivo && (
                      <p className="text-sm text-gray-600">Motivo: {item.motivo}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay datos para el rango seleccionado.</p>
            )}

<<<<<<< Updated upstream
          </CardContent>
        </Card>
      )}
    </div>
=======
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          {/* Filtros de fecha */}
          <div className="mb-4 p-4 bg-white border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-700">Rango de Fechas para Reportes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => handleFechaInicioChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white font-medium transition-all ${errorFecha
                      ? 'border-red-300 focus:ring-red-600 focus:border-red-600 hover:border-red-400'
                      : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600 hover:border-blue-300'
                    }`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => handleFechaFinChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white font-medium transition-all ${errorFecha
                      ? 'border-red-300 focus:ring-red-600 focus:border-red-600 hover:border-red-400'
                      : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600 hover:border-blue-300'
                    }`}
                />
              </div>
            </div>
            {errorFecha && (
              <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">{errorFecha}</p>
                  <p className="text-xs text-red-600 mt-1">Por favor, corrige el rango de fechas para generar el reporte.</p>
                </div>
              </div>
            )}
            {(fechaInicio || fechaFin) && !errorFecha && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 text-sm text-blue-700 font-medium">
                  {fechaInicio && fechaFin
                    ? `Mostrando datos desde ${fechaInicio} hasta ${fechaFin}`
                    : fechaInicio
                      ? `Mostrando datos desde ${fechaInicio}`
                      : `Mostrando datos hasta ${fechaFin}`}
                </div>
                <button
                  onClick={() => {
                    setFechaInicio('');
                    setFechaFin('');
                    setErrorFecha('');
                  }}
                  className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                >
                  Limpiar fechas
                </button>
              </div>
            )}
          </div>

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
>>>>>>> Stashed changes
  );
}
