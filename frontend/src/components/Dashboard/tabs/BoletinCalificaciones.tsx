import React, { useState, useEffect } from 'react';
import type {
    BoletinEstudiante,
    FiltrosBoletinCalificaciones,
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
    FileText,
    Award,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    TrendingUp,
} from 'lucide-react';
import { reportesService } from '../../../services/api/reportes.service';
import { estudiantesService } from '../../../services/api/estudiantes.service';
import { toast } from 'sonner';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BoletinCalificaciones: React.FC = () => {
    // Estado para estudiantes y boletines
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [boletines, setBoletines] = useState<BoletinEstudiante[]>([]);

    // Estado de carga y errores
    const [loading, setLoading] = useState({
        estudiantes: false,
        boletin: false,
    });
    const [error, setError] = useState<string | null>(null);

    const [filtros, setFiltros] = useState<FiltrosBoletinCalificaciones>({
        id_estudiante: null,
    });

    // Cargar estudiantes al montar
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

    // Cargar boletín cuando cambie el estudiante
    useEffect(() => {
        if (!filtros.id_estudiante) {
            setBoletines([]);
            setError(null);
            return;
        }

        const cargarBoletin = async () => {
            try {
                setLoading(prev => ({ ...prev, boletin: true }));
                setError(null);
                const data = await reportesService.getBoletinEstudiante(
                    filtros.id_estudiante!
                );
                setBoletines(data);
            } catch (err: any) {
                console.error('Error al cargar boletín:', err);
                setError(err.response?.data?.message || 'Error al cargar el boletín');
                toast.error('Error al cargar el boletín');
                setBoletines([]);
            } finally {
                setLoading(prev => ({ ...prev, boletin: false }));
            }
        };
        cargarBoletin();
    }, [filtros.id_estudiante]);

    const handleChangeFiltro = (valor: any) => {
        setFiltros({ id_estudiante: valor });
    };

    return (
        <Card>
            <CardHeader className="animate-fadeIn">
                <CardTitle className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    Boletín de Calificaciones
                </CardTitle>
                <CardDescription>
                    Reporte completo de notas por periodo con calificación definitiva
                </CardDescription>
            </CardHeader>

            <CardContent>
                {/* Filtros */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl animate-fadeIn">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Estudiante */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Estudiante <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_estudiante || ''}
                                onChange={(e) => handleChangeFiltro(Number(e.target.value) || null)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white font-medium hover:border-purple-300 transition-all"
                            >
                                <option value="">Selecciona un estudiante...</option>
                                {estudiantes.map(est => (
                                    <option key={est.id} value={est.id}>
                                        {est.nombre} {est.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>


                {/* Boletín */}
                {loading.boletin ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">Cargando boletín...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-red-200">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                ) : boletines.length > 0 ? (
                    <div className="animate-fadeIn">
                        {/* Encabezado del boletín - Usar primer boletín para info del estudiante */}
                        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-purple-900 mb-1">
                                        Boletín de Calificaciones
                                    </h2>
                                    <p className="text-sm text-purple-700">Programa GlobalEnglish</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 font-semibold">Estudiante:</p>
                                    <p className="text-gray-900 font-bold">{boletines[0].estudiante_nombre} {boletines[0].estudiante_apellidos}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Documento:</p>
                                    <p className="text-gray-900">{boletines[0].tipo_documento} {boletines[0].documento}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Institución:</p>
                                    <p className="text-gray-900">{boletines[0].institucion_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Sede:</p>
                                    <p className="text-gray-900">{boletines[0].sede_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Grado y Grupo:</p>
                                    <p className="text-gray-900">{boletines[0].grado}°{boletines[0].grupo}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Programa:</p>
                                    <p className="text-gray-900 font-bold">{boletines[0].programa}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de notas - UNA FILA POR PERIODO */}
                        <div className="mb-6 border-2 border-purple-200 rounded-xl overflow-x-auto shadow-md">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-100 to-purple-200">
                                    <tr>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 uppercase tracking-wider">
                                            Periodo
                                        </th>
                                        {/* Columnas dinámicas para cada componente (del primer periodo) */}
                                        {boletines[0].componentes.map((comp) => (
                                            <th key={comp.id_componente} className="px-4 py-4 text-center text-sm font-bold text-purple-900 uppercase tracking-wider">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span>{comp.nombre_componente}</span>
                                                    <span className="text-xs font-normal text-purple-700">({comp.porcentaje}%)</span>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 uppercase tracking-wider bg-purple-300">
                                            Nota Definitiva
                                        </th>
                                        <th className="px-4 py-4 text-center text-sm font-bold text-purple-900 uppercase tracking-wider bg-purple-300">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {boletines.map((boletin, idx) => (
                                        <tr key={idx} className="border-t-2 border-purple-200 hover:bg-purple-50 transition-colors">
                                            {/* Periodo */}
                                            <td className="px-4 py-4 text-center font-bold text-purple-900">
                                                {boletin.periodo_nombre}
                                            </td>

                                            {/* Notas de cada componente */}
                                            {boletin.componentes.map((comp) => (
                                                <td key={comp.id_componente} className="px-4 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="inline-flex items-center justify-center w-16 px-3 py-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 text-lg font-bold">
                                                            {comp.nota !== null ? Number(comp.nota).toFixed(1) : '—'}
                                                        </span>
                                                        <span className="text-xs text-purple-700 font-medium">
                                                            Pond: {Number(comp.nota_ponderada).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </td>
                                            ))}

                                            {/* Nota definitiva */}
                                            <td className="px-4 py-4 text-center bg-purple-50">
                                                <span className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-purple-600 text-white text-xl font-bold shadow-md">
                                                    <TrendingUp className="w-6 h-6" />
                                                    {Number(boletin.nota_definitiva).toFixed(2)}
                                                </span>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-4 py-4 text-center">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold ${Number(boletin.nota_definitiva) >= 70
                                                        ? 'bg-green-100 border-green-300 text-green-700'
                                                        : Number(boletin.nota_definitiva) >= 60
                                                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                                                            : 'bg-red-100 border-red-300 text-red-700'
                                                    }`}>
                                                    {Number(boletin.nota_definitiva) >= 70 ? (
                                                        <>
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            APROBADO
                                                        </>
                                                    ) : Number(boletin.nota_definitiva) >= 60 ? (
                                                        <>
                                                            <AlertTriangle className="w-5 h-5" />
                                                            CON DIFICULTADES
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-5 h-5" />
                                                            NO APROBADO
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Información adicional */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Escala de Calificación</p>
                                <p className="text-sm text-gray-700">0 - 100 puntos</p>
                            </div>
                            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Aprobación</p>
                                <p className="text-sm text-gray-700">≥ 70 puntos</p>
                            </div>
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">Con Dificultades</p>
                                <p className="text-sm text-gray-700">60 - 69 puntos</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                            Selecciona un estudiante para generar el boletín
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BoletinCalificaciones;
