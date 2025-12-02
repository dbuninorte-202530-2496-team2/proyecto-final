import React, { useState, useEffect } from 'react';
import type {
    AsistenciaEstudianteDetalle,
    AsistenciaEstudianteEstadisticas,
} from '../../../types/reportes';
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
    Calendar,
} from 'lucide-react';
import { reportesService } from '../../../services/api/reportes.service';
import { estudiantesService } from '../../../services/api/estudiantes.service';
import { toast } from 'sonner';

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea una fecha del backend (puede venir como YYYY-MM-DD o como timestamp)
 * a formato YYYY-MM-DD
 */
const formatearFecha = (fecha: string): string => {
    if (!fecha) return '';
    // Si ya está en formato YYYY-MM-DD, retornar tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
    // Si viene como timestamp, extraer solo la fecha
    return fecha.split('T')[0];
};

const calcularEstadisticas = (datos: AsistenciaEstudianteDetalle[], estudiante: Estudiante | null): AsistenciaEstudianteEstadisticas => {
    const total_programadas = datos.length;
    const total_asistidas = datos.filter(d => d.presente).length;
    const total_faltadas = datos.filter(d => !d.presente).length;
    const porcentaje_asistencia = total_programadas > 0
        ? Math.round((total_asistidas / total_programadas) * 100)
        : 0;

    return {
        id_estudiante: estudiante?.id || 0,
        nombre_completo: estudiante ? `${estudiante.nombre} ${estudiante.apellidos}` : '',
        documento: estudiante?.codigo || '',
        total_programadas,
        total_asistidas,
        total_faltadas,
        porcentaje_asistencia,
    };
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ReporteAsistenciaEstudiante: React.FC = () => {
    // Estado simplificado
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [asistenciaDetalle, setAsistenciaDetalle] = useState<AsistenciaEstudianteDetalle[]>([]);
    const [idEstudiante, setIdEstudiante] = useState<number | null>(null);
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');

    // Estado de carga y errores
    const [loading, setLoading] = useState({
        estudiantes: false,
        reporte: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [errorFechas, setErrorFechas] = useState<string | null>(null);

    // Cargar todos los estudiantes al montar
    useEffect(() => {
        const cargarEstudiantes = async () => {
            try {
                setLoading(prev => ({ ...prev, estudiantes: true }));
                const data = await estudiantesService.getAll();
                setEstudiantes(data);
            } catch (err: any) {
                console.error('Error al cargar estudiantes:', err);
                toast.error('Error al cargar estudiantes');
            } finally {
                setLoading(prev => ({ ...prev, estudiantes: false }));
            }
        };
        cargarEstudiantes();
    }, []);

    // Cargar reporte cuando cambie el estudiante o las fechas
    useEffect(() => {
        if (!idEstudiante) {
            setAsistenciaDetalle([]);
            setError(null);
            return;
        }

        // Validar fechas antes de hacer la petición
        if (fechaDesde && fechaHasta) {
            const desde = new Date(fechaDesde).getTime();
            const hasta = new Date(fechaHasta).getTime();
            if (hasta < desde) {
                setErrorFechas('La fecha "Hasta" debe ser posterior a la fecha "Desde"');
                return;
            }
        }
        setErrorFechas(null);

        const cargarReporte = async () => {
            try {
                setLoading(prev => ({ ...prev, reporte: true }));
                setError(null);
                const data = await reportesService.getAsistenciaEstudiante(
                    idEstudiante,
                    fechaDesde || undefined,
                    fechaHasta || undefined
                );
                setAsistenciaDetalle(data);
            } catch (err: any) {
                console.error('Error al cargar reporte de asistencia:', err);
                setError(err.response?.data?.message || 'Error al cargar el reporte de asistencia');
                toast.error('Error al cargar el reporte');
                setAsistenciaDetalle([]);
            } finally {
                setLoading(prev => ({ ...prev, reporte: false }));
            }
        };
        cargarReporte();
    }, [idEstudiante, fechaDesde, fechaHasta]);

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

    const handleFechaDesde = (value: string) => {
        setFechaDesde(value);
        validarFechas(value, fechaHasta);
    };

    const handleFechaHasta = (value: string) => {
        setFechaHasta(value);
        validarFechas(fechaDesde, value);
    };

    // Estudiante seleccionado
    const estudianteSeleccionado = estudiantes.find(e => e.id === idEstudiante) || null;

    // Estadísticas
    const estadisticas = calcularEstadisticas(asistenciaDetalle, estudianteSeleccionado);

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
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        {/* Estudiante */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Estudiante <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={idEstudiante || ''}
                                onChange={(e) => setIdEstudiante(Number(e.target.value) || null)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all"
                            >
                                <option value="">Selecciona un estudiante...</option>
                                {estudiantes.map(estudiante => (
                                    <option key={estudiante.id} value={estudiante.id}>
                                        {estudiante.nombre} {estudiante.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Rango de fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 items-end">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Desde (opcional)
                            </label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => handleFechaDesde(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Hasta (opcional)
                            </label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => handleFechaHasta(e.target.value)}
                                className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errorFechas
                                    ? 'border-red-400 focus:border-red-600 focus:ring-red-600 bg-red-50'
                                    : 'border-gray-300 focus:border-green-600 focus:ring-green-600'
                                    }`}
                            />
                        </div>

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
                {idEstudiante && estadisticas && !errorFechas && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Estudiante */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-900">Estudiante</span>
                            </div>
                            <p className="mt-2 text-lg font-bold text-blue-800">{estadisticas?.nombre_completo || '—'}</p>
                            <p className="text-sm text-blue-700">Documento: {estadisticas?.documento || '—'}</p>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all">
                                <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> Programadas
                                </div>
                                <div className="text-2xl font-bold text-blue-900 mt-2">{estadisticas.total_programadas}</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all">
                                <div className="text-green-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Asistidas
                                </div>
                                <div className="text-2xl font-bold text-green-900 mt-2">{estadisticas.total_asistidas}</div>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 hover:shadow-md transition-all">
                                <div className="text-red-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> Faltadas
                                </div>
                                <div className="text-2xl font-bold text-red-900 mt-2">{estadisticas.total_faltadas}</div>
                            </div>

                            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-4 border border-violet-200 hover:shadow-md transition-all">
                                <div className="text-violet-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" /> % Asistencia
                                </div>
                                <div className="text-2xl font-bold text-violet-900 mt-2">{estadisticas.porcentaje_asistencia}%</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de resultados */}
                {idEstudiante && !errorFechas ? (
                    loading.reporte ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-gray-200">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                                <p className="text-gray-600 font-medium">Cargando reporte...</p>
                            </div>
                        </div>
                    ) : asistenciaDetalle.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fadeIn">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Semana</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Fecha</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Día</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Horario</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">¿Asistió?</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {asistenciaDetalle.map((dato: AsistenciaEstudianteDetalle, idx: number) => (
                                            <tr
                                                key={idx}
                                                className={`transition-colors hover:bg-green-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <td className="px-4 py-3 text-sm font-bold text-green-700">Sem. {dato.semana_numero}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatearFecha(dato.fecha_real)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{dato.dia_semana}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                    {dato.hora_inicio.slice(0, 5)} - {dato.hora_fin.slice(0, 5)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {dato.presente ? (
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
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-red-200">
                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Selecciona un estudiante para generar el reporte</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReporteAsistenciaEstudiante;
