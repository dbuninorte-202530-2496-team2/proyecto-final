import React, { useMemo, useState } from 'react';
import type {
    AsistenciaEstudianteDetalle,
    AsistenciaEstudianteEstadisticas,
    FiltrosAsistenciaEstudiante,
} from '../../../types/reportes';
import type { Institucion } from '../../../types/institucion';
import type { Sede } from '../../../types/sede';
import type { Aula } from '../../../types/aula';
import type { Estudiante } from '../../../types/estudiante';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '../../ui/Card';
import {
    User,
    Search,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    CalendarRange,
    TrendingUp,
} from 'lucide-react';

// ============================================
// DATOS MOCK
// ============================================

const mockInstituciones: Institucion[] = [
    { id: 1, nombre: 'IED San José', correo: 'contacto@sanjose.edu.co', jornada: 'UNICA_MANANA', nombre_contacto: 'María García', telefono_contacto: '3001234567' },
    { id: 2, nombre: 'IED Santa María', correo: 'info@santamaria.edu.co', jornada: 'MANANA_TARDE', nombre_contacto: 'Pedro López', telefono_contacto: '3007654321' },
];

const mockSedes: Sede[] = [
    { id: 1, nombre: 'Sede Principal', direccion: 'Calle 10 #20-30', id_inst: 1, is_principal: true },
    { id: 2, nombre: 'Sede Norte', direccion: 'Carrera 5 #15-25', id_inst: 1, is_principal: false },
    { id: 3, nombre: 'Sede Central', direccion: 'Avenida 8 #12-18', id_inst: 2, is_principal: true },
];

const mockAulas: Aula[] = [
    { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
    { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
    { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
];

const mockEstudiantes: Estudiante[] = [
    { id: 1, nombres: 'Juan Carlos', apellidos: 'Pérez García', tipo_doc: 1, num_doc: '1234567890', id_aula: 1, score_in: 45, score_out: null },
    { id: 2, nombres: 'María Fernanda', apellidos: 'López Martínez', tipo_doc: 1, num_doc: '0987654321', id_aula: 1, score_in: 50, score_out: null },
    { id: 3, nombres: 'Carlos Alberto', apellidos: 'Rodríguez Sánchez', tipo_doc: 1, num_doc: '1122334455', id_aula: 2, score_in: 48, score_out: null },
];

const mockAsistenciaDetalle: AsistenciaEstudianteDetalle[] = [
    {
        fecha: '2025-02-03',
        id_aula: 1,
        aula: '4°A',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        horario: 'LU 07:00-07:45',
        asistio: true,
        id_motivo: null,
        motivo: null,
        observaciones: null,
    },
    {
        fecha: '2025-02-05',
        id_aula: 1,
        aula: '4°A',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        horario: 'MI 10:00-10:50',
        asistio: false,
        id_motivo: 1,
        motivo: 'Enfermedad',
        observaciones: 'Gripe',
    },
    {
        fecha: '2025-02-10',
        id_aula: 1,
        aula: '4°A',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        horario: 'LU 07:00-07:45',
        asistio: true,
        id_motivo: null,
        motivo: null,
        observaciones: null,
    },
    {
        fecha: '2025-02-12',
        id_aula: 1,
        aula: '4°A',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        horario: 'MI 10:00-10:50',
        asistio: true,
        id_motivo: null,
        motivo: null,
        observaciones: null,
    },
];

// ============================================
// UTILIDADES
// ============================================

const calcularEstadisticas = (
    datos: AsistenciaEstudianteDetalle[],
    estudiante: Estudiante | null,
): AsistenciaEstudianteEstadisticas | null => {
    if (!estudiante) return null;

    const total_programadas = datos.length;
    const total_asistidas = datos.filter(d => d.asistio).length;
    const total_faltadas = datos.filter(d => !d.asistio).length;
    const porcentaje_asistencia = total_programadas > 0
        ? Math.round((total_asistidas / total_programadas) * 100)
        : 0;

    return {
        id_estudiante: estudiante.id,
        nombre_completo: `${estudiante.nombres} ${estudiante.apellidos}`,
        documento: estudiante.num_doc,
        total_programadas,
        total_asistidas,
        total_faltadas,
        porcentaje_asistencia,
    };
};

const filtrarPorRango = (
    datos: AsistenciaEstudianteDetalle[],
    fechaDesde: string,
    fechaHasta: string,
): AsistenciaEstudianteDetalle[] => {
    if (!fechaDesde && !fechaHasta) return datos;

    return datos.filter(d => {
        const fecha = new Date(d.fecha).getTime();
        const desde = fechaDesde ? new Date(fechaDesde).getTime() : -Infinity;
        const hasta = fechaHasta ? new Date(fechaHasta).getTime() : Infinity;
        return fecha >= desde && fecha <= hasta;
    });
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ReporteAsistenciaEstudiante: React.FC = () => {
    const [instituciones] = useState<Institucion[]>(mockInstituciones);
    const [sedes] = useState<Sede[]>(mockSedes);
    const [aulas] = useState<Aula[]>(mockAulas);
    const [estudiantes] = useState<Estudiante[]>(mockEstudiantes);
    const [asistenciaDetalle] = useState<AsistenciaEstudianteDetalle[]>(mockAsistenciaDetalle);

    const [filtros, setFiltros] = useState<FiltrosAsistenciaEstudiante>({
        id_institucion: null,
        id_sede: null,
        id_aula: null,
        id_estudiante: null,
        fecha_desde: '',
        fecha_hasta: '',
    });

    const [errorFechas, setErrorFechas] = useState<string | null>(null);

    // Filtrar sedes por institución
    const sedesFiltradas = useMemo(() => {
        if (!filtros.id_institucion) return [];
        return sedes.filter(s => s.id_inst === filtros.id_institucion);
    }, [sedes, filtros.id_institucion]);

    // Filtrar aulas por sede
    const aulasFiltradas = useMemo(() => {
        if (!filtros.id_sede) return [];
        return aulas.filter(a => a.id_sede === filtros.id_sede);
    }, [aulas, filtros.id_sede]);

    // Filtrar estudiantes por aula
    const estudiantesFiltrados = useMemo(() => {
        if (!filtros.id_aula) return [];
        return estudiantes.filter(e => e.id_aula === filtros.id_aula);
    }, [estudiantes, filtros.id_aula]);

    // Estudiante seleccionado
    const estudianteSeleccionado = useMemo(() => {
        if (!filtros.id_estudiante) return null;
        return estudiantes.find(e => e.id === filtros.id_estudiante) || null;
    }, [estudiantes, filtros.id_estudiante]);

    // Validar fechas
    const validarFechas = (desde: string, hasta: string) => {
        if (!desde || !hasta) {
            setErrorFechas(null);
            return true;
        }
        const desdeTime = new Date(desde).getTime();
        const hastaTime = new Date(hasta).getTime();
        if (hastaTime < desdeTime) {
            setErrorFechas('La fecha "Hasta" debe ser posterior a la fecha "Desde"');
            return false;
        }
        setErrorFechas(null);
        return true;
    };

    const handleChangeFiltro = (campo: keyof FiltrosAsistenciaEstudiante, valor: any) => {
        setFiltros(prev => {
            const nuevos = { ...prev, [campo]: valor };

            // Resetear filtros dependientes
            if (campo === 'id_institucion') {
                nuevos.id_sede = null;
                nuevos.id_aula = null;
                nuevos.id_estudiante = null;
            } else if (campo === 'id_sede') {
                nuevos.id_aula = null;
                nuevos.id_estudiante = null;
            } else if (campo === 'id_aula') {
                nuevos.id_estudiante = null;
            }

            return nuevos;
        });

        // Validar fechas
        if (campo === 'fecha_desde') {
            validarFechas(valor, filtros.fecha_hasta);
        } else if (campo === 'fecha_hasta') {
            validarFechas(filtros.fecha_desde, valor);
        }
    };

    // Datos filtrados
    const datosFiltrados = useMemo(() => {
        if (errorFechas) return [];

        // En producción, aquí filtrarías por estudiante seleccionado
        // Por ahora mostramos todos los datos mock
        return filtrarPorRango(asistenciaDetalle, filtros.fecha_desde, filtros.fecha_hasta);
    }, [asistenciaDetalle, filtros, errorFechas]);

    // Estadísticas
    const estadisticas = useMemo(() => {
        return calcularEstadisticas(datosFiltrados, estudianteSeleccionado);
    }, [datosFiltrados, estudianteSeleccionado]);

    const puedeGenerarReporte = filtros.id_institucion && filtros.id_sede && filtros.id_aula && filtros.id_estudiante && !errorFechas;

    return (
        <Card>
            <CardHeader className="animate-fadeIn">
                <CardTitle className="flex items-center gap-2">
                    <User className="w-6 h-6 text-green-600" />
                    Reporte de Asistencia por Estudiante
                </CardTitle>
                <CardDescription>
                    Historial completo de asistencia de un estudiante individual
                </CardDescription>
            </CardHeader>

            <CardContent>
                {/* Filtros */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Institución */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Institución <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_institucion || ''}
                                onChange={(e) => handleChangeFiltro('id_institucion', Number(e.target.value) || null)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all"
                            >
                                <option value="">Selecciona una institución</option>
                                {instituciones.map(inst => (
                                    <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sede */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Sede <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_sede || ''}
                                onChange={(e) => handleChangeFiltro('id_sede', Number(e.target.value) || null)}
                                disabled={!filtros.id_institucion}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona una sede</option>
                                {sedesFiltradas.map(sede => (
                                    <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Aula */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Aula <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_aula || ''}
                                onChange={(e) => handleChangeFiltro('id_aula', Number(e.target.value) || null)}
                                disabled={!filtros.id_sede}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona un aula</option>
                                {aulasFiltradas.map(aula => (
                                    <option key={aula.id} value={aula.id}>
                                        {aula.grado}°{aula.grupo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Estudiante */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Estudiante <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_estudiante || ''}
                                onChange={(e) => handleChangeFiltro('id_estudiante', Number(e.target.value) || null)}
                                disabled={!filtros.id_aula}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona un estudiante</option>
                                {estudiantesFiltrados.map(est => (
                                    <option key={est.id} value={est.id}>
                                        {est.nombres} {est.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Rango de fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 items-end">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Desde
                            </label>
                            <input
                                type="date"
                                value={filtros.fecha_desde}
                                onChange={(e) => handleChangeFiltro('fecha_desde', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Hasta
                            </label>
                            <input
                                type="date"
                                value={filtros.fecha_hasta}
                                onChange={(e) => handleChangeFiltro('fecha_hasta', e.target.value)}
                                className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errorFechas
                                    ? 'border-red-400 focus:border-red-600 focus:ring-red-600 bg-red-50'
                                    : 'border-gray-300 focus:border-green-600 focus:ring-green-600'
                                    }`}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setFiltros(prev => ({ ...prev, fecha_desde: '', fecha_hasta: '' }));
                                setErrorFechas(null);
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-100"
                        >
                            <CalendarRange className="w-4 h-4" />
                            Limpiar fechas
                        </button>
                    </div>

                    {/* Error de validación */}
                    {errorFechas && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3 animate-fadeIn">
                            <div className="text-red-600 font-semibold text-sm">⚠️ {errorFechas}</div>
                        </div>
                    )}
                </div>

                {/* Información del estudiante y estadísticas */}
                {puedeGenerarReporte && estadisticas && (
                    <div className="mb-6 animate-fadeIn">
                        {/* Info del estudiante */}
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                    {estudianteSeleccionado?.nombres.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{estadisticas.nombre_completo}</h3>
                                    <p className="text-sm text-gray-600">Documento: {estadisticas.documento}</p>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-md transition-all">
                                <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Programadas</div>
                                <div className="text-2xl font-bold text-blue-900 mt-2">{estadisticas.total_programadas}</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition-all">
                                <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">Asistidas</div>
                                <div className="text-2xl font-bold text-green-900 mt-2">{estadisticas.total_asistidas}</div>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500 hover:shadow-md transition-all">
                                <div className="text-red-600 text-sm font-semibold uppercase tracking-wide">Faltadas</div>
                                <div className="text-2xl font-bold text-red-900 mt-2">{estadisticas.total_faltadas}</div>
                            </div>

                            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border-l-4 border-violet-500 hover:shadow-md transition-all">
                                <div className="text-violet-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    % Asistencia
                                </div>
                                <div className="text-2xl font-bold text-violet-900 mt-2">{estadisticas.porcentaje_asistencia}%</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de resultados */}
                {puedeGenerarReporte ? (
                    datosFiltrados.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fadeIn">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Fecha</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Aula</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Tutor</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Horario</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">¿Asistió?</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Motivo Ausencia</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {datosFiltrados.map((dato, idx) => (
                                            <tr
                                                key={idx}
                                                className={`transition-colors hover:bg-green-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{dato.fecha}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{dato.aula}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{dato.nombre_tutor}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{dato.horario}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {dato.asistio ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 border border-green-300 text-green-700 text-xs font-semibold">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Presente
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
                                                            <XCircle className="w-3 h-3" />
                                                            Ausente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {dato.motivo || <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 italic">
                                                    {dato.observaciones || <span className="text-gray-400">—</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No hay datos para el rango de fechas seleccionado</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Selecciona institución, sede, aula y estudiante para generar el reporte</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReporteAsistenciaEstudiante;
