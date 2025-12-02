import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import {
  personalService,
  asistenciaTutorService,
  aulasService,
  asistenciaEstudiantesService,
  type ClaseProgramada,
  type AsistenciaMasivaDto
} from '../../../services/api';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Plus,
  Edit2,
  ArrowLeft,
  Save
} from 'lucide-react';

const hoyISO = (): string => new Date().toISOString().split('T')[0];

const AsistenciaEstudianteTab: React.FC = () => {
  const { usuario, rol } = useAuth();

  // Estados para selección de clase
  const [tutores, setTutores] = useState<any[]>([]);
  const [tutorSeleccionadoId, setTutorSeleccionadoId] = useState<number>(0);
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>(hoyISO());
  const [clasesProgramadas, setClasesProgramadas] = useState<ClaseProgramada[]>([]);
  const [loadingClases, setLoadingClases] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clasesConAsistencia, setClasesConAsistencia] = useState<Set<string>>(new Set());

  // Estados para tomar asistencia
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseProgramada | null>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [asistenciaState, setAsistenciaState] = useState<Record<number, boolean>>({});
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar tutores al montar
  useEffect(() => {
    const fetchTutores = async () => {
      try {
        const tutoresList = await personalService.getTutores();
        setTutores(tutoresList);

        if (tutoresList.length > 0) {
          if (rol === 'TUTOR' && usuario) {
            const correo = typeof usuario === 'string' ? usuario : (usuario as any).correo;
            const tutorEncontrado = tutoresList.find(t => t.correo === correo);
            if (tutorEncontrado) {
              setTutorSeleccionadoId(tutorEncontrado.id);
            } else {
              setTutorSeleccionadoId(tutoresList[0].id);
            }
          } else {
            setTutorSeleccionadoId(tutoresList[0].id);
          }
        }
      } catch (error: any) {
        toast.error('Error al cargar tutores');
      }
    };

    fetchTutores();
  }, [rol, usuario]);

  // Cargar fecha inicial más temprana
  useEffect(() => {
    if (!tutorSeleccionadoId) return;

    const fetchEarliestDate = async () => {
      try {
        const earliest = await asistenciaTutorService.getEarliestWeekDate(tutorSeleccionadoId);
        setFechaDesde(earliest || hoyISO());
      } catch (error: any) {
        setFechaDesde(hoyISO());
      }
    };

    fetchEarliestDate();
  }, [tutorSeleccionadoId]);

  // Cargar clases programadas
  useEffect(() => {
    if (!tutorSeleccionadoId || !fechaDesde || !fechaHasta) return;

    const fetchClases = async () => {
      try {
        setLoadingClases(true);
        const clases = await asistenciaTutorService.getClasesProgramadas(
          tutorSeleccionadoId,
          fechaDesde,
          fechaHasta
        );
        setClasesProgramadas(clases);

        // Verificar qué clases ya tienen asistencia registrada
        const clasesConReg = new Set<string>();
        for (const clase of clases) {
          try {
            const asistenciasAula = await asistenciaEstudiantesService.getPorAula(clase.id_aula);
            const fecha = clase.fecha_programada.split('T')[0];
            const tieneAsistencia = asistenciasAula.some((a: any) =>
              a.fecha_real?.split('T')[0] === fecha &&
              a.id_horario === clase.id_horario
            );
            if (tieneAsistencia) {
              clasesConReg.add(`${clase.id_aula}-${clase.id_horario}-${fecha}`);
            }
          } catch (error) {
            // Ignorar errores de carga individual
          }
        }
        setClasesConAsistencia(clasesConReg);
      } catch (error: any) {
        toast.error('Error al cargar clases');
        setClasesProgramadas([]);
      } finally {
        setLoadingClases(false);
      }
    };

    fetchClases();
  }, [tutorSeleccionadoId, fechaDesde, fechaHasta]);

  // Cargar estudiantes cuando se selecciona una clase
  useEffect(() => {
    if (!claseSeleccionada) return;

    const fetchEstudiantes = async () => {
      try {
        setLoadingEstudiantes(true);
        // 1. Obtener lista de estudiantes del aula
        const estudiantesAula = await aulasService.getEstudiantes(claseSeleccionada.id_aula);
        setEstudiantes(estudiantesAula);

        // 2. Intentar cargar asistencia ya registrada
        try {
          const asistenciasAula = await asistenciaEstudiantesService.getPorAula(claseSeleccionada.id_aula);

          // Filtrar solo las asistencias de esta fecha/horario específico
          const fecha = claseSeleccionada.fecha_programada.split('T')[0];
          const asistenciasClase = asistenciasAula.filter((a: any) =>
            a.fecha_real?.split('T')[0] === fecha &&
            a.id_horario === claseSeleccionada.id_horario
          );

          // Si hay asistencias registradas, cargar el estado
          if (asistenciasClase.length > 0) {
            const estadoCargado: Record<number, boolean> = {};
            asistenciasClase.forEach((a: any) => {
              estadoCargado[a.id_estudiante] = a.presente;
            });
            setAsistenciaState(estadoCargado);
          } else {
            // Inicializar todos como presentes
            const inicial: Record<number, boolean> = {};
            estudiantesAula.forEach((e: any) => {
              inicial[e.id] = true;
            });
            setAsistenciaState(inicial);
          }
        } catch (error) {
          // Si falla cargar asistencias, inicializar todos como presentes
          const inicial: Record<number, boolean> = {};
          estudiantesAula.forEach((e: any) => {
            inicial[e.id] = true;
          });
          setAsistenciaState(inicial);
        }

      } catch (error: any) {
        toast.error('Error al cargar estudiantes');
        setEstudiantes([]);
      } finally {
        setLoadingEstudiantes(false);
      }
    };

    fetchEstudiantes();
  }, [claseSeleccionada]);

  // Filtrar clases
  const clasesFiltradas = useMemo(() => {
    return clasesProgramadas.filter(c => {
      const matchesSearch =
        c.fecha_programada.includes(searchTerm) ||
        c.aula_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.horario_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.institucion_nombre.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [clasesProgramadas, searchTerm]);

  // Handlers
  const handleTomarAsistencia = (clase: ClaseProgramada) => {
    setClaseSeleccionada(clase);
  };

  const handleToggleEstudiante = (id: number) => {
    setAsistenciaState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGuardarAsistencia = async () => {
    if (!claseSeleccionada) return;

    try {
      setSaving(true);
      const presentes = Object.entries(asistenciaState)
        .filter(([_, presente]) => presente)
        .map(([id, _]) => Number(id));

      const dto: AsistenciaMasivaDto = {
        fecha_real: claseSeleccionada.fecha_programada.split('T')[0],
        id_aula: claseSeleccionada.id_aula,
        id_horario: claseSeleccionada.id_horario,
        estudiantes_presentes: presentes
      };

      console.log('Enviando DTO:', dto); // Para debugging

      await asistenciaEstudiantesService.registrarAsistenciaMasiva(dto);
      toast.success('Asistencia de estudiantes guardada correctamente');

      // Actualizar el set de clases con asistencia
      const fecha = claseSeleccionada.fecha_programada.split('T')[0];
      setClasesConAsistencia(prev => new Set(prev).add(`${claseSeleccionada.id_aula}-${claseSeleccionada.id_horario}-${fecha}`));

      setClaseSeleccionada(null);
    } catch (error: any) {
      console.error('Error al guardar asistencia:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Error desconocido al guardar asistencia';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Helper para verificar si se puede tomar asistencia
  const puedeTomarAsistencia = (clase: ClaseProgramada) => {
    // Habilitado si:
    // 1. El tutor marcó que DICTÓ CLASE
    // 2. O si NO DICTÓ CLASE pero hay FECHA DE REPOSICIÓN
    if (clase.dicto_clase) return true;
    if (!clase.dicto_clase && clase.fecha_reposicion) return true;
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="w-6 h-6 text-blue-600" />
              Asistencia de Estudiantes
            </CardTitle>
            <CardDescription className="text-blue-600/80">
              Registro de asistencia de estudiantes por clase programada.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Vista Principal: Lista de Clases */}
        {!claseSeleccionada ? (
          <>
            {/* Filtros */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Tutor</label>
                  <select
                    value={tutorSeleccionadoId}
                    onChange={(e) => setTutorSeleccionadoId(Number(e.target.value))}
                    disabled={rol === 'TUTOR' || tutores.length === 0}
                    className={`w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all hover:border-blue-300 ${rol === 'TUTOR' || tutores.length === 0 ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : 'bg-white text-gray-700'}`}
                  >
                    {tutores.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Desde</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm transition-all hover:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Hasta</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm transition-all hover:border-blue-300"
                  />
                </div>
              </div>
            </div>

            {/* Buscador */}
            <div className="mb-6 relative group">
              <Search className="absolute left-3 top-3 w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Buscar clase por aula, horario, sede o institución..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:shadow-md"
              />
            </div>

            {/* Tabla de Clases */}
            <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Horario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Aula / Institución</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Estado Tutor</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingClases ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse">Cargando clases programadas...</td></tr>
                  ) : clasesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Calendar className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-lg font-medium">No se encontraron clases programadas</p>
                          <p className="text-sm">Intenta ajustar los filtros de fecha o búsqueda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    clasesFiltradas.map((clase, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {clase.fecha_programada.split('T')[0]}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{clase.horario_info.replace(/(\d{2}:\d{2}):\d{2}/g, '$1')}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-semibold text-gray-800">{clase.aula_info}</div>
                          <div className="text-xs text-blue-600 font-medium">{clase.institucion_nombre}</div>
                          <div className="text-xs text-gray-400">{clase.sede_nombre}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {clase.dicto_clase !== null ? (
                            clase.dicto_clase ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Dictó
                              </span>
                            ) : clase.fecha_reposicion ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                                <Calendar className="w-3.5 h-3.5" /> Repuesta
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                                <XCircle className="w-3.5 h-3.5" /> No Dictó
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {(() => {
                            const tieneAsistencia = clasesConAsistencia.has(`${clase.id_aula}-${clase.id_horario}-${clase.fecha_programada.split('T')[0]}`);
                            const puedeAccion = puedeTomarAsistencia(clase);

                            return (
                              <button
                                onClick={() => handleTomarAsistencia(clase)}
                                disabled={!puedeAccion}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all transform active:scale-95 ${puedeAccion
                                  ? tieneAsistencia
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                  }`}
                              >
                                {puedeAccion ? (
                                  tieneAsistencia ? (
                                    <><Edit2 className="w-3.5 h-3.5" /> Editar</>
                                  ) : (
                                    <><Plus className="w-3.5 h-3.5" /> Registrar</>
                                  )
                                ) : (
                                  'No disponible'
                                )}
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Vista Detalle: Tomar Asistencia */
          <div className="animate-fadeIn">
            <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
              <button
                onClick={() => setClaseSeleccionada(null)}
                className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>
              <div className="text-right">
                <h3 className="text-xl font-bold text-blue-900">
                  {claseSeleccionada.aula_info} - {claseSeleccionada.sede_nombre}
                </h3>
                <p className="text-sm font-medium text-blue-600/80">
                  {claseSeleccionada.fecha_programada.split('T')[0]}
                  <span className="mx-2">•</span>
                  {claseSeleccionada.horario_info.replace(/(\d{2}:\d{2}):\d{2}/g, '$1')}
                </p>
              </div>
            </div>

            {loadingEstudiantes ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Cargando lista de estudiantes...</p>
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-lg">No hay estudiantes inscritos en esta aula.</p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-700 text-lg">Listado de Estudiantes <span className="text-gray-400 text-sm font-normal">({estudiantes.length})</span></span>
                    <div className="flex gap-4 text-sm font-medium">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Presentes: <span className="font-bold">{Object.values(asistenciaState).filter(v => v).length}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Ausentes: <span className="font-bold">{Object.values(asistenciaState).filter(v => !v).length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                    {estudiantes.map(est => (
                      <div
                        key={est.id}
                        onClick={() => handleToggleEstudiante(est.id)}
                        className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-all ${asistenciaState[est.id]
                          ? 'bg-white hover:bg-green-50/30'
                          : 'bg-red-50/30 hover:bg-red-50/50'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${asistenciaState[est.id]
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                            : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                            }`}>
                            {est.nombre?.charAt(0) || '?'}{est.apellidos?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className={`font-bold text-base ${asistenciaState[est.id] ? 'text-gray-800' : 'text-red-800'}`}>
                              {est.nombre} {est.apellidos}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{est.codigo}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${asistenciaState[est.id]
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                          {asistenciaState[est.id] ? 'Presente' : 'Ausente'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setClaseSeleccionada(null)}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarAsistencia}
                    disabled={saving}
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Asistencia
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AsistenciaEstudianteTab;
