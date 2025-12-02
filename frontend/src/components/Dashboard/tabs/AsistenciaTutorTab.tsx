import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Calendar, Plus, Edit2, Search, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import {
    personalService,
    asistenciaTutorService,
    motivoService,
    festivoService,
    type ClaseProgramada,
    type Motivo,
    type Festivo
} from '../../../services/api';

const hoyISO = (): string => new Date().toISOString().split('T')[0];

interface FormData {
    fecha: string;
    id_aula: number;
    id_horario: number;
    id_semana: number;
    dictoClase: boolean;
    id_motivo: number | string;
    observaciones: string;
    fecha_reposicion: string;
}

const AsistenciaTutorTab: React.FC = () => {
    const { usuario, rol } = useAuth();

    // Estados para datos del servidor
    const [tutores, setTutores] = useState<any[]>([]);
    const [tutorSeleccionadoId, setTutorSeleccionadoId] = useState<number>(0);
    const [clasesProgramadas, setClasesProgramadas] = useState<ClaseProgramada[]>([]);
    const [motivos, setMotivos] = useState<Motivo[]>([]);
    const [festivos, setFestivos] = useState<Festivo[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMotivos, setLoadingMotivos] = useState(false);

    // Filtros de fecha
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>(hoyISO());

    // Estados del formulario
    const [showForm, setShowForm] = useState(false);
    const [editingAsistencia, setEditingAsistencia] = useState<ClaseProgramada | null>(null);
    const [formData, setFormData] = useState<FormData>({
        fecha: hoyISO(),
        id_aula: 0,
        id_horario: 0,
        id_semana: 0,
        dictoClase: true,
        id_motivo: '',
        observaciones: '',
        fecha_reposicion: '',
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<'TODOS' | 'DICTO_CLASE' | 'NO_DICTO_CLASE' | 'PENDIENTE' | 'REPUESTA'>('TODOS');

    // Cargar tutores al montar
    useEffect(() => {
        const fetchTutores = async () => {
            try {
                const tutoresList = await personalService.getTutores();
                setTutores(tutoresList);

                if (tutoresList.length > 0) {
                    // Auto-seleccionar tutor si es TUTOR logueado
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

    // Cargar fecha inicial más temprana cuando se selecciona un tutor
    useEffect(() => {
        if (!tutorSeleccionadoId) return;

        const fetchEarliestDate = async () => {
            try {
                const earliest = await asistenciaTutorService.getEarliestWeekDate(tutorSeleccionadoId);
                if (earliest) {
                    setFechaDesde(earliest);
                } else {
                    // Si no hay semanas, usar hoy como fallback
                    setFechaDesde(hoyISO());
                }
            } catch (error: any) {
                // En caso de error, usar hoy como fallback
                setFechaDesde(hoyISO());
            }
        };

        fetchEarliestDate();
    }, [tutorSeleccionadoId]);

    // Cargar motivos al montar
    useEffect(() => {
        const fetchMotivos = async () => {
            try {
                setLoadingMotivos(true);
                const motivosList = await motivoService.getAll();
                setMotivos(motivosList);
            } catch (error: any) {
                toast.error('Error al cargar motivos');
            } finally {
                setLoadingMotivos(false);
            }
        };

        fetchMotivos();
    }, []);

    // Cargar festivos cuando cambian los filtros de fecha
    useEffect(() => {
        if (!fechaDesde || !fechaHasta) return;

        const fetchFestivos = async () => {
            try {
                const festivosList = await festivoService.getAll();
                // Filtrar festivos en el rango
                const festivosEnRango = festivosList.filter(f => {
                    const fechaFestivo = f.fecha.split('T')[0];
                    return fechaFestivo >= fechaDesde && fechaFestivo <= fechaHasta;
                });
                setFestivos(festivosEnRango);
            } catch (error: any) {
                // Silencioso - festivos son opcionales
            }
        };

        fetchFestivos();
    }, [fechaDesde, fechaHasta]);

    // Cargar clases programadas cuando cambian los filtros
    useEffect(() => {
        if (!tutorSeleccionadoId || !fechaDesde || !fechaHasta) return;

        const fetchClases = async () => {
            try {
                setLoading(true);
                const clases = await asistenciaTutorService.getClasesProgramadas(
                    tutorSeleccionadoId,
                    fechaDesde,
                    fechaHasta
                );
                setClasesProgramadas(clases);
            } catch (error: any) {
                toast.error('Error al cargar clases');
                setClasesProgramadas([]);
            } finally {
                setLoading(false);
            }
        };

        fetchClases();
    }, [tutorSeleccionadoId, fechaDesde, fechaHasta]);

    // Helper: Verificar si una fecha es festivo
    const esFestivo = (fecha: string): Festivo | undefined => {
        const fechaNormalizada = fecha.split('T')[0];
        return festivos.find(f => f.fecha.split('T')[0] === fechaNormalizada);
    };

    // Helper: Obtener ID del motivo "Festivo"
    const getMotivoFestivoId = (): number | null => {
        const motivoFestivo = motivos.find(m =>
            m.descripcion.toLowerCase().includes('festivo')
        );
        return motivoFestivo ? motivoFestivo.id : null;
    };

    // Filtrar clases
    const clasesFiltradas = useMemo(() => {
        return clasesProgramadas.filter(c => {
            const matchesSearch =
                c.fecha_programada.includes(searchTerm) ||
                c.aula_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.horario_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.institucion_nombre.toLowerCase().includes(searchTerm.toLowerCase());

            // Determinar el estado de la clase
            let estado = 'PENDIENTE';
            if (c.tiene_asistencia) {
                if (c.dicto_clase) {
                    estado = 'DICTO_CLASE';
                } else if (c.fecha_reposicion) {
                    estado = 'REPUESTA';  // Clase no dictada pero ya repuesta
                } else {
                    estado = 'NO_DICTO_CLASE';
                }
            }

            const matchesEstado = filterEstado === 'TODOS' || estado === filterEstado;

            return matchesSearch && matchesEstado;
        });
    }, [clasesProgramadas, searchTerm, filterEstado]);

    // Stats
    const stats = useMemo(() => {
        const total = clasesProgramadas.length;
        const dictoClase = clasesProgramadas.filter(c => c.tiene_asistencia && c.dicto_clase).length;
        const noDictoClase = clasesProgramadas.filter(c => c.tiene_asistencia && !c.dicto_clase).length;
        const pendientes = clasesProgramadas.filter(c => !c.tiene_asistencia).length;
        // Cumplimiento = dictó clase O la repuso
        const cumplio = clasesProgramadas.filter(c =>
            c.tiene_asistencia && (c.dicto_clase || c.fecha_reposicion)
        ).length;
        const cumplimiento = total > 0 ? (cumplio / total) * 100 : 0;

        return { total, dictoClase, noDictoClase, pendientes, cumplimiento };
    }, [clasesProgramadas]);

    // Handlers
    const openCreateForm = (clase?: ClaseProgramada) => {
        const festivo = clase ? esFestivo(clase.fecha_programada) : null;
        const motivoFestivoId = getMotivoFestivoId();

        setEditingAsistencia(clase || null);
        setFormData({
            fecha: clase ? clase.fecha_programada.split('T')[0] : hoyISO(),
            id_aula: clase ? clase.id_aula : 0,
            id_horario: clase ? clase.id_horario : 0,
            id_semana: clase ? clase.id_semana : 0,
            // Si es festivo, auto-marcar como no dictó con motivo festivo
            dictoClase: festivo ? false : true,
            id_motivo: (festivo && motivoFestivoId) ? motivoFestivoId : '',
            observaciones: '',
            fecha_reposicion: '',
        });
        setFormError(null);
        setShowForm(true);
    };

    const openEditForm = (clase: ClaseProgramada) => {
        setEditingAsistencia(clase);
        setFormData({
            fecha: clase.fecha_programada.split('T')[0],
            id_aula: clase.id_aula,
            id_horario: clase.id_horario,
            id_semana: clase.id_semana,
            dictoClase: clase.dicto_clase || false,
            id_motivo: clase.id_motivo || '',
            observaciones: '',
            fecha_reposicion: clase.fecha_reposicion ? clase.fecha_reposicion.split('T')[0] : '',
        });
        setFormError(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingAsistencia(null);
        setFormError(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'radio' && name === 'dictoClase') {
            setFormData(prev => ({ ...prev, dictoClase: value === 'true' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setFormError(null);
    };

    const validateForm = (): string | null => {
        if (!formData.fecha) return 'La fecha es requerida';
        if (!formData.id_horario) return 'El horario es requerido';
        if (!formData.dictoClase && !formData.id_motivo) {
            return 'El motivo es requerido cuando no se dictó clase';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            setFormError(error);
            return;
        }

        try {
            setSubmitting(true);

            const dto: any = {
                fecha_real: formData.fecha,
                dictoClase: formData.dictoClase,
                id_tutor: tutorSeleccionadoId,
                id_aula: formData.id_aula,
                id_horario: formData.id_horario,
                ...(formData.dictoClase ? {} : { id_motivo: Number(formData.id_motivo) }),
                // Siempre enviar fecha_reposicion: null si está vacía, string si tiene valor
                fecha_reposicion: formData.fecha_reposicion || null,
            };

            if (editingAsistencia && editingAsistencia.id_asistencia) {
                // Actualizar existente
                await asistenciaTutorService.update(editingAsistencia.id_asistencia, dto);
                toast.success('Asistencia actualizada');
            } else {
                // Crear nuevo
                await asistenciaTutorService.create(dto);
                toast.success('Asistencia registrada');
            }

            // Recargar clases
            const clases = await asistenciaTutorService.getClasesProgramadas(
                tutorSeleccionadoId,
                fechaDesde,
                fechaHasta
            );
            setClasesProgramadas(clases);

            closeForm();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al guardar';
            toast.error(message);
            setFormError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const getEstadoBadge = (clase: ClaseProgramada) => {
        if (!clase.tiene_asistencia) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    <AlertCircle className="w-3 h-3" />
                    Pendiente
                </span>
            );
        }

        if (clase.dicto_clase) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Dictó Clase
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <XCircle className="w-3 h-3" />
                No Dictó Clase
            </span>
        );
    };

    const tutorSeleccionado = tutores.find(t => t.id === tutorSeleccionadoId);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4 w-full">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-green-600" />
                            Asistencia del Tutor
                        </CardTitle>
                        <CardDescription>
                            Supervisión y registro de clases dictadas por los tutores.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Filtros Principales */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Selector de Tutor */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                Tutor
                            </label>
                            <select
                                value={tutorSeleccionadoId}
                                onChange={(e) => setTutorSeleccionadoId(Number(e.target.value))}
                                disabled={rol === 'TUTOR' || tutores.length === 0}
                                className={`w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white font-medium transition-all hover:border-indigo-300 ${rol === 'TUTOR' || tutores.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                {tutores.length === 0 ? (
                                    <option value={0}>Cargando...</option>
                                ) : (
                                    tutores.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre} {t.apellido}
                                        </option>
                                    ))
                                )}
                            </select>
                            {rol === 'TUTOR' && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Como tutor, solo puedes ver y registrar tu propia asistencia.
                                </p>
                            )}
                        </div>

                        {/* Fecha Desde */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Desde
                            </label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white font-medium"
                            />
                        </div>

                        {/* Fecha Hasta */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Hasta
                            </label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Programadas</div>
                        <div className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</div>
                        <div className="text-xs text-blue-700 mt-1">En el rango seleccionado</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">Dictadas</div>
                        <div className="text-3xl font-bold text-green-900 mt-2">{stats.dictoClase}</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border-l-4 border-amber-500">
                        <div className="text-amber-600 text-sm font-semibold uppercase tracking-wide">Pendientes</div>
                        <div className="text-3xl font-bold text-amber-900 mt-2">{stats.pendientes}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Cumplimiento</div>
                        <div className="text-3xl font-bold text-purple-900 mt-2">{stats.cumplimiento.toFixed(0)}%</div>
                        <div className="text-xs text-purple-700 mt-1">Clases dictadas</div>
                    </div>
                </div>

                {/* Filtros Secundarios */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por fecha, aula, horario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                        />
                    </div>
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value as any)}
                        className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="DICTO_CLASE">Dictó Clase</option>
                        <option value="NO_DICTO_CLASE">No Dictó Clase</option>
                        <option value="REPUESTA">Repuesta</option>
                        <option value="PENDIENTE">Pendiente</option>
                    </select>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Horario</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Institución</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Aula</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Motivo</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Reposición</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                        Cargando clases...
                                    </td>
                                </tr>
                            ) : clasesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 italic">
                                        {searchTerm || filterEstado !== 'TODOS'
                                            ? 'No se encontraron registros con ese criterio de búsqueda'
                                            : `No hay clases programadas para ${tutorSeleccionado?.nombre || 'este tutor'} en este rango de fechas.`}
                                    </td>
                                </tr>
                            ) : (
                                clasesFiltradas.map((clase, idx) => (
                                    <tr key={`${clase.id_aula}-${clase.id_horario}-${clase.fecha_programada}`} className="hover:bg-green-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{clase.fecha_programada.split('T')[0]}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{clase.horario_info.replace(/(\d{2}:\d{2}):\d{2}/g, '$1')}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{clase.institucion_nombre}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <span>{clase.aula_info} - {clase.sede_nombre}</span>
                                                {esFestivo(clase.fecha_programada) && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                                                        Festivo
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{getEstadoBadge(clase)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {clase.descripcion_motivo && (
                                                <div className="flex items-start gap-1">
                                                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                    <span className="font-medium text-orange-700">{clase.descripcion_motivo}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {clase.fecha_reposicion && (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium text-green-700">{clase.fecha_reposicion.split('T')[0]}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                {!clase.tiene_asistencia ? (
                                                    <button
                                                        onClick={() => openCreateForm(clase)}
                                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        Registrar
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openEditForm(clase)}
                                                        className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            {/* Modal Formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">
                            {editingAsistencia?.tiene_asistencia ? 'Editar Asistencia' : `Registrar Asistencia - ${tutorSeleccionado?.nombre} ${tutorSeleccionado?.apellido}`}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Mostrar alerta si es festivo */}
                            {editingAsistencia && esFestivo(editingAsistencia.fecha_programada) && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                    <div className="flex items-start gap-2">
                                        <span className="text-2xl">🎉</span>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900">Fecha Festiva</p>
                                            <p className="text-xs text-blue-700 mt-1">
                                                {esFestivo(editingAsistencia.fecha_programada)?.descripcion || 'Esta fecha está marcada como festivo. Se ha pre-seleccionado "No dictó clase" con motivo festivo.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha"
                                        required
                                        value={formData.fecha}
                                        onChange={handleFormChange}
                                        disabled={!!editingAsistencia}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aula <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAsistencia ? `${editingAsistencia.aula_info} - ${editingAsistencia.sede_nombre}` : 'Selecciona fecha y horario'}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className={`flex items-center gap-2 ${esFestivo(formData.fecha) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                        <input
                                            type="radio"
                                            name="dictoClase"
                                            value="true"
                                            checked={formData.dictoClase === true}
                                            onChange={handleFormChange}
                                            disabled={!!esFestivo(formData.fecha)}
                                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Dictó Clase</span>
                                    </label>
                                    <label className={`flex items-center gap-2 ${esFestivo(formData.fecha) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                        <input
                                            type="radio"
                                            name="dictoClase"
                                            value="false"
                                            checked={formData.dictoClase === false}
                                            onChange={handleFormChange}
                                            disabled={!!esFestivo(formData.fecha)}
                                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">No Dictó Clase</span>
                                    </label>
                                </div>
                            </div>

                            {!formData.dictoClase && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Motivo <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="id_motivo"
                                            required={!formData.dictoClase}
                                            value={formData.id_motivo}
                                            onChange={handleFormChange}
                                            disabled={!!esFestivo(formData.fecha)}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${esFestivo(formData.fecha) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">-- Seleccionar motivo --</option>
                                            {motivos.map(m => (
                                                <option key={m.id} value={m.id}>{m.descripcion}</option>
                                            ))}
                                        </select>
                                        {loadingMotivos && <p className="text-xs text-gray-500 mt-1">Cargando motivos...</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha de Reposición
                                        </label>
                                        <input
                                            type="date"
                                            name="fecha_reposicion"
                                            value={formData.fecha_reposicion}
                                            onChange={handleFormChange}
                                            max={hoyISO()}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Opcional: Ingresar la fecha en que se repuso la clase</p>
                                    </div>
                                </>
                            )}

                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{formError}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={submitting}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default AsistenciaTutorTab;
