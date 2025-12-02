import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { FileText, Download, Search, ClipboardList, CheckCircle, XCircle, Clock, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { personalService } from '../../../services/api/personal.service';
import { reportesService, type AsistenciaTutorReporte, type NotasTutorReporte } from '../../../services/api';
import type { Personal } from '../../../types/personal';
import { toast } from 'sonner';

const ReportesTutorTab: React.FC = () => {
    const { rol, personalId } = useAuth();
    const [activeTab, setActiveTab] = useState<'asistencia' | 'notas'>('asistencia');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Data states
    const [asistencias, setAsistencias] = useState<AsistenciaTutorReporte[]>([]);
    const [notas, setNotas] = useState<NotasTutorReporte[]>([]);

    // Tutor Selection State
    const [tutores, setTutores] = useState<Personal[]>([]);
    const [tutorSeleccionadoId, setTutorSeleccionadoId] = useState<number | null>(null);

    // Load tutors for Admin or use personalId for TUTOR
    useEffect(() => {
        const loadTutores = async () => {
            if (rol === 'TUTOR') {
                // For tutors, use their personalId directly
                if (personalId) {
                    setTutorSeleccionadoId(personalId);
                }
            } else {
                // For admin, load all tutors
                try {
                    const data = await personalService.getTutores();
                    setTutores(data);
                    if (data.length > 0) {
                        setTutorSeleccionadoId(data[0].id);
                    }
                } catch (error) {
                    toast.error('Error al cargar tutores');
                    console.error('Error loading tutors:', error);
                }
            }
        };
        loadTutores();
    }, [rol, personalId]);

    // Load data when tutor selection or filters change
    useEffect(() => {
        if (tutorSeleccionadoId === null) return;

        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'asistencia') {
                    const data = await reportesService.getAsistenciaTutor(tutorSeleccionadoId, {
                        fecha_inicio: fechaInicio || undefined,
                        fecha_fin: fechaFin || undefined,
                    });
                    setAsistencias(data);
                } else {
                    const data = await reportesService.getNotasTutor(tutorSeleccionadoId);
                    setNotas(data);
                }
            } catch (error) {
                toast.error('Error al cargar datos del reporte');
                console.error('Error loading report data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [tutorSeleccionadoId, activeTab, fechaInicio, fechaFin]);

    // Filtering Logic
    const filteredAsistencias = asistencias.filter(a =>
    (`${a.aula_grado}°${a.aula_grupo}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.institucion_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredNotas = notas.filter(n =>
    (n.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${n.aula_grado}°${n.aula_grupo}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.sede_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const [pdfLoading, setPdfLoading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!tutorSeleccionadoId) {
            toast.error('No hay tutor seleccionado');
            return;
        }

        setPdfLoading(true);
        try {
            let blob: Blob;
            let filename: string;

            if (activeTab === 'asistencia') {
                blob = await reportesService.getAsistenciaTutorPDF(tutorSeleccionadoId, {
                    fecha_inicio: fechaInicio || undefined,
                    fecha_fin: fechaFin || undefined,
                });
                filename = `reporte-asistencia-tutor-${tutorSeleccionadoId}-${new Date().toISOString().split('T')[0]}.pdf`;
            } else {
                blob = await reportesService.getNotasTutorPDF(tutorSeleccionadoId);
                filename = `reporte-notas-tutor-${tutorSeleccionadoId}-${new Date().toISOString().split('T')[0]}.pdf`;
            }

            // Create object URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF generado exitosamente');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el PDF');
        } finally {
            setPdfLoading(false);
        }
    };

    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        return dateStr.split('T')[0]; // YYYY-MM-DD
    };

    const formatTime = (timeStr: string): string => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5); // HH:mm
    };

    const getEstadoFromData = (asistencia: AsistenciaTutorReporte): 'DICTADA' | 'NO_DICTADA' | 'REPUESTA' | 'PENDIENTE' => {
        // Use estado field from database if available
        if (asistencia.estado) {
            return asistencia.estado as 'DICTADA' | 'NO_DICTADA' | 'REPUESTA' | 'PENDIENTE';
        }

        // Fallback logic
        if (asistencia.dicto_clase === null || asistencia.dicto_clase === undefined) {
            return 'PENDIENTE';
        } else if (asistencia.dicto_clase) {
            return 'DICTADA';
        } else if (asistencia.fecha_reposicion) {
            return 'REPUESTA';
        } else {
            return 'NO_DICTADA';
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'DICTADA':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Dictada</span>;
            case 'NO_DICTADA':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> No Dictada</span>;
            case 'REPUESTA':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3" /> Repuesta</span>;
            case 'PENDIENTE':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pendiente</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{estado}</span>;
        }
    };

    const tutorSeleccionado = tutores.find(t => t.id === tutorSeleccionadoId);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-blue-600" />
                            {rol === 'TUTOR' ? 'Autogestión del Tutor' : 'Gestión de Tutores'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {rol === 'TUTOR'
                                ? 'Reporte detallado de tu actividad académica y cumplimiento.'
                                : 'Supervisión de la actividad y cumplimiento de los tutores.'}
                        </p>
                        {tutorSeleccionado && (
                            <p className="text-sm font-semibold text-blue-700 mt-2">
                                Tutor: {tutorSeleccionado.nombre} {tutorSeleccionado.apellido}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('asistencia')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'asistencia'
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {rol === 'TUTOR' ? 'Mi Asistencia' : 'Asistencia Tutor'}
                        </button>
                        <button
                            onClick={() => setActiveTab('notas')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'notas'
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {rol === 'TUTOR' ? 'Registro de Notas' : 'Log de Notas'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="border-none shadow-sm bg-gray-50/50">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        {/* Tutor Selector for Admin */}
                        {rol !== 'TUTOR' && (
                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Seleccionar Tutor</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select
                                        value={tutorSeleccionadoId || ''}
                                        onChange={(e) => setTutorSeleccionadoId(Number(e.target.value))}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                    >
                                        {tutores.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Hasta</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className={rol !== 'TUTOR' ? "md:col-span-1" : "md:col-span-2"}>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Buscar</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'asistencia' ? "Buscar por aula, sede o institución..." : "Buscar por estudiante, aula o sede..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Content */}
            <Card className="border-gray-200 shadow-md overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100 py-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                            {activeTab === 'asistencia' ? <Clock className="w-5 h-5 text-blue-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                            {activeTab === 'asistencia' ? 'Historial de Clases Dictadas' : 'Log de Calificaciones Registradas'}
                        </CardTitle>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={pdfLoading || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            {pdfLoading ? 'Generando PDF...' : 'Descargar PDF'}
                        </button>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="px-6 py-10 text-center text-gray-500">
                            Cargando datos...
                        </div>
                    ) : activeTab === 'asistencia' ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Horario</th>
                                    <th className="px-6 py-3">Aula / Sede / Institución</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredAsistencias.length > 0 ? (
                                    filteredAsistencias.map((asistencia, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{formatDate(asistencia.fecha_real)}</div>
                                                <div className="text-xs text-gray-500">{asistencia.dia_semana}</div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {formatTime(asistencia.hora_inicio)} - {formatTime(asistencia.hora_fin)}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-gray-900">{asistencia.aula_grado}°{asistencia.aula_grupo}</div>
                                                <div className="text-xs text-gray-500">{asistencia.sede_nombre}</div>
                                                <div className="text-xs text-gray-400">{asistencia.institucion_nombre}</div>
                                            </td>
                                            <td className="px-6 py-3">{getStatusBadge(getEstadoFromData(asistencia))}</td>
                                            <td className="px-6 py-3 text-gray-500 text-xs max-w-xs">
                                                {asistencia.motivo_descripcion && (
                                                    <div className="mb-1">
                                                        <span className="font-semibold">Motivo:</span> {asistencia.motivo_descripcion}
                                                    </div>
                                                )}
                                                {asistencia.fecha_reposicion && (
                                                    <div>
                                                        <span className="font-semibold">Repuesta el:</span> {formatDate(asistencia.fecha_reposicion)}
                                                    </div>
                                                )}
                                                {!asistencia.motivo_descripcion && !asistencia.fecha_reposicion && '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                            No se encontraron registros de clases en este periodo.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Estudiante</th>
                                    <th className="px-6 py-3">Aula / Sede / Institución</th>
                                    <th className="px-6 py-3">Componente / Periodo</th>
                                    <th className="px-6 py-3 text-center">Nota</th>
                                    <th className="px-6 py-3">Comentario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredNotas.length > 0 ? (
                                    filteredNotas.map((nota, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-900">{nota.estudiante_nombre}</td>
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-gray-900">{nota.aula_grado}°{nota.aula_grupo}</div>
                                                <div className="text-xs text-gray-500">{nota.sede_nombre}</div>
                                                <div className="text-xs text-gray-400">{nota.institucion_nombre}</div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="text-gray-900">{nota.componente_nombre}</div>
                                                <div className="text-xs text-gray-500">
                                                    {nota.periodo_anho} - Periodo {nota.periodo_numero}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`font-bold text-base ${nota.valor_nota < 70 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {nota.valor_nota}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-gray-500 max-w-xs truncate">
                                                {nota.comentario || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                            No se encontraron registros de notas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReportesTutorTab;
