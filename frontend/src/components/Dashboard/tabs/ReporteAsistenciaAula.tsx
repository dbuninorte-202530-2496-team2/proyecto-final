import React, { useMemo, useState } from 'react';
import type { AsistenciaAulaDetalle, AsistenciaAulaEstadisticas, FiltrosAsistenciaAula } from '../../../types/reportes';
import type { Institucion } from '../../../types/institucion';
import type { Sede } from '../../../types/sede';
import type { Aula } from '../../../types/aula';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '../../ui/Card';
import {
    FileText,
    Search,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    CalendarRange,
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

const mockAsistenciaDetalle: AsistenciaAulaDetalle[] = [
    {
        semana: 1,
        fecha_real: '2025-02-03',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        dia_semana: 'Lunes',
        horario: 'LU 07:00-07:45',
        es_festivo: false,
        hubo_clase: true,
        horas_dictadas: 1,
        horas_no_dictadas: 0,
        motivo_no_clase: null,
        hubo_reposicion: false,
        fecha_reposicion: null,
    },
    {
        semana: 1,
        fecha_real: '2025-02-05',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        dia_semana: 'Miércoles',
        horario: 'MI 10:00-10:50',
        es_festivo: false,
        hubo_clase: false,
        horas_dictadas: 0,
        horas_no_dictadas: 1,
        motivo_no_clase: 'Incapacidad Médica',
        hubo_reposicion: true,
        fecha_reposicion: '2025-02-12',
    },
    {
        semana: 2,
        fecha_real: '2025-02-10',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        dia_semana: 'Lunes',
        horario: 'LU 07:00-07:45',
        es_festivo: false,
        hubo_clase: true,
        horas_dictadas: 1,
        horas_no_dictadas: 0,
        motivo_no_clase: null,
        hubo_reposicion: false,
        fecha_reposicion: null,
    },
    {
        semana: 2,
        fecha_real: '2025-02-12',
        id_tutor: 2,
        nombre_tutor: 'Laura Rodríguez',
        dia_semana: 'Miércoles',
        horario: 'MI 10:00-10:50',
        es_festivo: false,
        hubo_clase: true,
        horas_dictadas: 1,
        horas_no_dictadas: 0,
        motivo_no_clase: null,
        hubo_reposicion: false,
        fecha_reposicion: null,
    },
];

// ============================================
// UTILIDADES
// ============================================

const calcularEstadisticas = (datos: AsistenciaAulaDetalle[]): AsistenciaAulaEstadisticas => {
    const total_programadas = datos.length;
    const total_dictadas = datos.filter(d => d.hubo_clase).length;
    const total_no_dictadas = datos.filter(d => !d.hubo_clase).length;
    const total_con_reposicion = datos.filter(d => d.hubo_reposicion).length;
    const porcentaje_cumplimiento = total_programadas > 0
        ? Math.round((total_dictadas / total_programadas) * 100)
        : 0;

    return {
        total_programadas,
        total_dictadas,
        total_no_dictadas,
        total_con_reposicion,
        porcentaje_cumplimiento,
    };
};

const filtrarPorRango = (
    datos: AsistenciaAulaDetalle[],
    fechaDesde: string,
    fechaHasta: string,
): AsistenciaAulaDetalle[] => {
    if (!fechaDesde && !fechaHasta) return datos;

    return datos.filter(d => {
        const fecha = new Date(d.fecha_real).getTime();
        const desde = fechaDesde ? new Date(fechaDesde).getTime() : -Infinity;
        const hasta = fechaHasta ? new Date(fechaHasta).getTime() : Infinity;
        return fecha >= desde && fecha <= hasta;
    });
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ReporteAsistenciaAula: React.FC = () => {
    const [instituciones] = useState<Institucion[]>(mockInstituciones);
    const [sedes] = useState<Sede[]>(mockSedes);
    const [aulas] = useState<Aula[]>(mockAulas);
    const [asistenciaDetalle] = useState<AsistenciaAulaDetalle[]>(mockAsistenciaDetalle);

    const [filtros, setFiltros] = useState<FiltrosAsistenciaAula>({
        id_institucion: null,
        id_sede: null,
        id_aula: null,
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

    const handleChangeFiltro = (campo: keyof FiltrosAsistenciaAula, valor: any) => {
        setFiltros(prev => {
            const nuevos = { ...prev, [campo]: valor };

            // Resetear filtros dependientes
            if (campo === 'id_institucion') {
                nuevos.id_sede = null;
                nuevos.id_aula = null;
            } else if (campo === 'id_sede') {
                nuevos.id_aula = null;
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

        // En producción, aquí filtrarías por aula seleccionada
        // Por ahora mostramos todos los datos mock
        return filtrarPorRango(asistenciaDetalle, filtros.fecha_desde, filtros.fecha_hasta);
    }, [asistenciaDetalle, filtros, errorFechas]);

    // Estadísticas
    const estadisticas = useMemo(() => {
        return calcularEstadisticas(datosFiltrados);
    }, [datosFiltrados]);

    const puedeGenerarReporte = filtros.id_institucion && filtros.id_sede && filtros.id_aula && !errorFechas;

    return (
        <Card>
            <CardHeader className="animate-fadeIn">
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Reporte de Asistencia por Aula (Detallado)
                </CardTitle>
                <CardDescription>
                    Historial completo de clases con información detallada por semana
                </CardDescription>
            </CardHeader>

            <CardContent>
                {/* Filtros */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Institución */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Institución <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_institucion || ''}
                                onChange={(e) => handleChangeFiltro('id_institucion', Number(e.target.value) || null)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium hover:border-blue-300 transition-all"
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
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-medium hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona un aula</option>
                                {aulasFiltradas.map(aula => (
                                    <option key={aula.id} value={aula.id}>
                                        {aula.grado}°{aula.grupo}
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
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
                                    : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
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

                {/* Estadísticas */}
                {puedeGenerarReporte && datosFiltrados.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 animate-fadeIn">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-md transition-all">
                            <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Programadas</div>
                            <div className="text-2xl font-bold text-blue-900 mt-2">{estadisticas.total_programadas}</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition-all">
                            <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">Dictadas</div>
                            <div className="text-2xl font-bold text-green-900 mt-2">{estadisticas.total_dictadas}</div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500 hover:shadow-md transition-all">
                            <div className="text-red-600 text-sm font-semibold uppercase tracking-wide">No Dictadas</div>
                            <div className="text-2xl font-bold text-red-900 mt-2">{estadisticas.total_no_dictadas}</div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border-l-4 border-amber-500 hover:shadow-md transition-all">
                            <div className="text-amber-600 text-sm font-semibold uppercase tracking-wide">Con Reposición</div>
                            <div className="text-2xl font-bold text-amber-900 mt-2">{estadisticas.total_con_reposicion}</div>
                        </div>

                        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border-l-4 border-violet-500 hover:shadow-md transition-all">
                            <div className="text-violet-600 text-sm font-semibold uppercase tracking-wide">Cumplimiento</div>
                            <div className="text-2xl font-bold text-violet-900 mt-2">{estadisticas.porcentaje_cumplimiento}%</div>
                        </div>
                    </div>
                )}

                {/* Tabla de resultados */}
                {puedeGenerarReporte ? (
                    datosFiltrados.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fadeIn">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Semana</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Fecha</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Tutor</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Día</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Horario</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">¿Festivo?</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">¿Hubo Clase?</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">H. Dictadas</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">H. No Dictadas</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Motivo</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">¿Reposición?</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Fecha Repos.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {datosFiltrados.map((dato, idx) => (
                                            <tr
                                                key={idx}
                                                className={`transition-colors hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <td className="px-4 py-3 text-sm font-bold text-blue-700">Sem. {dato.semana}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{dato.fecha_real}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{dato.nombre_tutor}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{dato.dia_semana}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{dato.horario}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {dato.es_festivo ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs font-semibold">
                                                            <Calendar className="w-3 h-3" />
                                                            Sí
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {dato.hubo_clase ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 border border-green-300 text-green-700 text-xs font-semibold">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Sí
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
                                                            <XCircle className="w-3 h-3" />
                                                            No
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm font-semibold text-green-700">{dato.horas_dictadas}</td>
                                                <td className="px-4 py-3 text-center text-sm font-semibold text-red-700">{dato.horas_no_dictadas}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {dato.motivo_no_clase || <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {dato.hubo_reposicion ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-700 text-xs font-semibold">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Sí
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-blue-700 font-medium">
                                                    {dato.fecha_reposicion || <span className="text-gray-400">—</span>}
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
                        <p className="text-gray-500 font-medium">Selecciona institución, sede y aula para generar el reporte</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReporteAsistenciaAula;
