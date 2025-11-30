import React, { useMemo, useState } from 'react';
import type {
    BoletinEstudiante,
    FiltrosBoletinCalificaciones,
} from '../../../types/reportes';
import type { Institucion } from '../../../types/institucion';
import type { Sede } from '../../../types/sede';
import type { Aula } from '../../../types/aula';
import type { Estudiante } from '../../../types/estudiante';
import type { Periodo } from '../../../types/periodo';
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

const mockPeriodos: Periodo[] = [
    { id: 1, nombre: 'Periodo 1', anio: 2025, fec_ini: '2025-02-01', fec_fin: '2025-04-30' },
    { id: 2, nombre: 'Periodo 2', anio: 2025, fec_ini: '2025-05-01', fec_fin: '2025-07-31' },
];

const mockBoletines: BoletinEstudiante[] = [
    {
        id_estudiante: 1,
        nombre_estudiante: 'Juan Carlos Pérez García',
        documento: '1234567890',
        tipo_documento: 'TI',
        institucion: 'IED San José',
        sede: 'Sede Principal',
        grado: 4,
        grupo: 'A',
        programa: 'INSIDE',
        periodo: 'Periodo 1 - 2025',
        componentes: [
            {
                id_componente: 1,
                nombre_componente: 'Listening',
                porcentaje: 25,
                nota: 85,
                nota_ponderada: 21.25,
            },
            {
                id_componente: 2,
                nombre_componente: 'Speaking',
                porcentaje: 25,
                nota: 90,
                nota_ponderada: 22.50,
            },
            {
                id_componente: 3,
                nombre_componente: 'Reading',
                porcentaje: 25,
                nota: 80,
                nota_ponderada: 20.00,
            },
            {
                id_componente: 4,
                nombre_componente: 'Writing',
                porcentaje: 25,
                nota: 88,
                nota_ponderada: 22.00,
            },
        ],
        nota_definitiva: 85.75,
        estado_aprobacion: 'APROBADO',
    },
];

// ============================================
// UTILIDADES
// ============================================

const obtenerColorEstado = (estado: string): string => {
    switch (estado) {
        case 'APROBADO':
            return 'bg-green-100 border-green-300 text-green-700';
        case 'APROBADO_CON_DIFICULTADES':
            return 'bg-amber-100 border-amber-300 text-amber-700';
        case 'NO_APROBADO':
            return 'bg-red-100 border-red-300 text-red-700';
        default:
            return 'bg-gray-100 border-gray-300 text-gray-700';
    }
};

const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
        case 'APROBADO':
            return <CheckCircle2 className="w-5 h-5" />;
        case 'APROBADO_CON_DIFICULTADES':
            return <AlertTriangle className="w-5 h-5" />;
        case 'NO_APROBADO':
            return <XCircle className="w-5 h-5" />;
        default:
            return null;
    }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BoletinCalificaciones: React.FC = () => {
    const [instituciones] = useState<Institucion[]>(mockInstituciones);
    const [sedes] = useState<Sede[]>(mockSedes);
    const [aulas] = useState<Aula[]>(mockAulas);
    const [estudiantes] = useState<Estudiante[]>(mockEstudiantes);
    const [periodos] = useState<Periodo[]>(mockPeriodos);
    const [boletines] = useState<BoletinEstudiante[]>(mockBoletines);

    const [filtros, setFiltros] = useState<FiltrosBoletinCalificaciones>({
        id_institucion: null,
        id_sede: null,
        id_aula: null,
        id_estudiante: null,
        id_periodo: null,
    });

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

    // Aula seleccionada
    const aulaSeleccionada = useMemo(() => {
        if (!filtros.id_aula) return null;
        return aulas.find(a => a.id === filtros.id_aula) || null;
    }, [aulas, filtros.id_aula]);

    // Sede seleccionada
    const sedeSeleccionada = useMemo(() => {
        if (!filtros.id_sede) return null;
        return sedes.find(s => s.id === filtros.id_sede) || null;
    }, [sedes, filtros.id_sede]);

    // Institución seleccionada
    const institucionSeleccionada = useMemo(() => {
        if (!filtros.id_institucion) return null;
        return instituciones.find(i => i.id === filtros.id_institucion) || null;
    }, [instituciones, filtros.id_institucion]);

    const handleChangeFiltro = (campo: keyof FiltrosBoletinCalificaciones, valor: any) => {
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
    };

    // Boletín actual (mock - en producción vendría del backend)
    const boletinActual = useMemo(() => {
        if (!filtros.id_estudiante || !filtros.id_periodo) return null;

        // En producción, aquí buscarías el boletín específico
        // Por ahora retornamos el mock
        return boletines[0];
    }, [boletines, filtros]);

    const puedeGenerarBoletin = filtros.id_institucion && filtros.id_sede && filtros.id_aula && filtros.id_estudiante && filtros.id_periodo;

    return (
        <Card>
            <CardHeader className="animate-fadeIn">
                <CardTitle className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    Boletín de Calificaciones
                </CardTitle>
                <CardDescription>
                    Reporte completo de notas con calificación definitiva
                </CardDescription>
            </CardHeader>

            <CardContent>
                {/* Filtros */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Institución */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Institución <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_institucion || ''}
                                onChange={(e) => handleChangeFiltro('id_institucion', Number(e.target.value) || null)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white font-medium hover:border-purple-300 transition-all"
                            >
                                <option value="">Selecciona...</option>
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
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white font-medium hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona...</option>
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
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white font-medium hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona...</option>
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
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white font-medium hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecciona...</option>
                                {estudiantesFiltrados.map(est => (
                                    <option key={est.id} value={est.id}>
                                        {est.nombres} {est.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Periodo */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Periodo <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.id_periodo || ''}
                                onChange={(e) => handleChangeFiltro('id_periodo', Number(e.target.value) || null)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white font-medium hover:border-purple-300 transition-all"
                            >
                                <option value="">Selecciona...</option>
                                {periodos.map(per => (
                                    <option key={per.id} value={per.id}>{per.nombre} - {per.anio}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Boletín */}
                {puedeGenerarBoletin && boletinActual ? (
                    <div className="animate-fadeIn">
                        {/* Encabezado del boletín */}
                        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-purple-900 mb-1">
                                        Boletín de Calificaciones
                                    </h2>
                                    <p className="text-sm text-purple-700">Programa GlobalEnglish</p>
                                </div>
                                <div className={`px-4 py-2 rounded-lg border-2 font-bold flex items-center gap-2 ${obtenerColorEstado(boletinActual.estado_aprobacion)}`}>
                                    {obtenerIconoEstado(boletinActual.estado_aprobacion)}
                                    {boletinActual.estado_aprobacion.replace(/_/g, ' ')}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 font-semibold">Estudiante:</p>
                                    <p className="text-gray-900 font-bold">{boletinActual.nombre_estudiante}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Documento:</p>
                                    <p className="text-gray-900">{boletinActual.tipo_documento} {boletinActual.documento}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Institución:</p>
                                    <p className="text-gray-900">{boletinActual.institucion}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Sede:</p>
                                    <p className="text-gray-900">{boletinActual.sede}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Grado y Grupo:</p>
                                    <p className="text-gray-900">{boletinActual.grado}°{boletinActual.grupo}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold">Programa:</p>
                                    <p className="text-gray-900 font-bold">{boletinActual.programa}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-600 font-semibold">Periodo:</p>
                                    <p className="text-gray-900">{boletinActual.periodo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de notas */}
                        <div className="mb-6 border-2 border-purple-200 rounded-xl overflow-hidden shadow-md">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-100 to-purple-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 uppercase tracking-wider">
                                            Componente
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-purple-900 uppercase tracking-wider">
                                            Porcentaje
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-purple-900 uppercase tracking-wider">
                                            Nota
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-purple-900 uppercase tracking-wider">
                                            Nota Ponderada
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-purple-100">
                                    {boletinActual.componentes.map((comp, idx) => (
                                        <tr key={comp.id_componente} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {comp.nombre_componente}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                                                {comp.porcentaje}%
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-16 px-3 py-1 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 text-sm font-bold">
                                                    {comp.nota !== null ? comp.nota.toFixed(1) : '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-bold text-purple-700">
                                                {comp.nota_ponderada.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Fila de total */}
                                    <tr className="bg-gradient-to-r from-purple-100 to-purple-200 border-t-4 border-purple-400">
                                        <td className="px-6 py-4 text-sm font-bold text-purple-900 uppercase" colSpan={3}>
                                            NOTA DEFINITIVA
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-lg font-bold shadow-md">
                                                <TrendingUp className="w-5 h-5" />
                                                {boletinActual.nota_definitiva.toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
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
                            Selecciona institución, sede, aula, estudiante y periodo para generar el boletín
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BoletinCalificaciones;
