import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';
import type { Horario } from '../../../types/horario';
import type { Aula } from '../../../types/aula';
import type { TutorAula, AulaHorario } from '../../../types/asignaciones';
import type { Personal } from '../../../types/personal';

// Mock Data (duplicated for independence, ideally should be shared or fetched)
const mockHorarios: Horario[] = [
    { id: 1, dia_sem: 'LU', hora_ini: '07:00', hora_fin: '07:45' },
    { id: 2, dia_sem: 'LU', hora_ini: '07:45', hora_fin: '08:30' },
    { id: 3, dia_sem: 'MI', hora_ini: '10:00', hora_fin: '10:50' },
    { id: 4, dia_sem: 'JU', hora_ini: '08:30', hora_fin: '09:15' },
    { id: 5, dia_sem: 'VI', hora_ini: '11:00', hora_fin: '11:45' },
];

const mockAulas: Aula[] = [
    { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
    { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
    { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
];

const mockTutorAula: TutorAula[] = [
    { id: 1, id_aula: 1, id_tutor: 1, fecha_asignado: '2025-02-01', fecha_desasignado: null },
    { id: 2, id_aula: 3, id_tutor: 3, fecha_asignado: '2025-02-10', fecha_desasignado: null },
    // Adding more for demo
    { id: 3, id_aula: 2, id_tutor: 2, fecha_asignado: '2025-02-01', fecha_desasignado: null },
];

const mockAulaHorario: AulaHorario[] = [
    { id: 1, id_aula: 1, id_horario: 1 },
    { id: 2, id_aula: 1, id_horario: 2 },
    { id: 3, id_aula: 3, id_horario: 3 },
    { id: 4, id_aula: 2, id_horario: 4 },
    { id: 5, id_aula: 1, id_horario: 5 },
];

const mockTutores: Personal[] = [
    {
        id: 1,
        nombres: 'Laura',
        apellidos: 'Rodríguez',
        correo: 'laura.rod@globalenglish.edu.co',
        telefono: '3002223344',
        tipo_doc: 1,
        num_doc: '1012345678',
        id_rol: 2,
    },
    {
        id: 3,
        nombres: 'Carlos',
        apellidos: 'Martínez',
        correo: 'carlos.mtz@globalenglish.edu.co',
        telefono: '3003334455',
        tipo_doc: 1,
        num_doc: '1009876543',
        id_rol: 2,
    },
];

const DIAS_ORDER = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
const DIAS_FULL = {
    LU: 'Lunes',
    MA: 'Martes',
    MI: 'Miércoles',
    JU: 'Jueves',
    VI: 'Viernes',
    SA: 'Sábado',
    DO: 'Domingo',
};

const HorariosTutorTab: React.FC = () => {
    const { usuario, rol } = useAuth();
    const [tutorId, setTutorId] = useState<number | null>(null);

    useEffect(() => {
        if (rol === 'TUTOR' && usuario) {
            if (typeof usuario === 'string') {
                let tutor = mockTutores.find(t => t.correo === usuario);

                if (!tutor) {
                    const termino = usuario.toLowerCase();
                    tutor = mockTutores.find(t =>
                        t.nombres.toLowerCase().includes(termino) ||
                        t.apellidos.toLowerCase().includes(termino) ||
                        `${t.nombres} ${t.apellidos}`.toLowerCase().includes(termino)
                    );
                }

                if (tutor) {
                    setTutorId(tutor.id);
                } else {
                    console.warn('No se encontró coincidencia exacta para el usuario en HorariosTutorTab, usando fallback ID 1');
                    setTutorId(1);
                }
            } else if ((usuario as any).id) {
                setTutorId((usuario as any).id);
            }
        }
    }, [usuario, rol]);

    const miHorario = useMemo(() => {
        if (!tutorId) return [];

        // 1. Encontrar aulas asignadas al tutor
        const misAulasIds = mockTutorAula
            .filter(ta => ta.id_tutor === tutorId && !ta.fecha_desasignado)
            .map(ta => ta.id_aula);

        // 2. Encontrar horarios de esas aulas
        const misHorariosIds = mockAulaHorario
            .filter(ah => misAulasIds.includes(ah.id_aula))
            .map(ah => ({ id_horario: ah.id_horario, id_aula: ah.id_aula }));

        // 3. Construir objeto completo
        const resultado = misHorariosIds.map(item => {
            const horario = mockHorarios.find(h => h.id === item.id_horario);
            const aula = mockAulas.find(a => a.id === item.id_aula);
            if (!horario || !aula) return null;
            return { ...horario, aula };
        }).filter(Boolean) as (Horario & { aula: Aula })[];

        // 4. Ordenar por día y hora
        return resultado.sort((a, b) => {
            const diaA = DIAS_ORDER.indexOf(a.dia_sem);
            const diaB = DIAS_ORDER.indexOf(b.dia_sem);
            if (diaA !== diaB) return diaA - diaB;
            return a.hora_ini.localeCompare(b.hora_ini);
        });
    }, [tutorId]);

    if (rol !== 'TUTOR') {
        return (
            <Card>
                <CardContent className="p-6 text-center text-gray-500">
                    Esta vista es exclusiva para tutores.
                </CardContent>
            </Card>
        );
    }

    if (!tutorId) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-gray-500">
                    No se pudo identificar la información del tutor.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        Mi Horario Académico
                    </CardTitle>
                    <CardDescription>
                        Consulta tus clases asignadas por día y aula
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {miHorario.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No tienes clases asignadas actualmente.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                                        <th className="px-4 py-3 text-left text-sm font-bold text-blue-900">Día</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-blue-900">Hora Inicio</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-blue-900">Hora Fin</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-blue-900">Aula</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-blue-900">Sede</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {miHorario.map((clase, idx) => (
                                        <tr
                                            key={idx}
                                            className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-gray-800">
                                                        {DIAS_FULL[clase.dia_sem as keyof typeof DIAS_FULL]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-green-600" />
                                                    <span className="text-gray-700">{clase.hora_ini}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-red-600" />
                                                    <span className="text-gray-700">{clase.hora_fin}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-purple-600" />
                                                    <span className="font-medium text-gray-800">
                                                        {clase.aula.grado}°{clase.aula.grupo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-orange-600" />
                                                    <span className="text-gray-700">Sede {clase.aula.id_sede}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Resumen estadístico */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-blue-800" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-700 font-semibold">Total de Clases</p>
                                            <p className="text-2xl font-bold text-blue-900">{miHorario.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-green-800" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-700 font-semibold">Aulas Asignadas</p>
                                            <p className="text-2xl font-bold text-green-900">
                                                {new Set(miHorario.map(h => h.aula.id)).size}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-purple-800" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-purple-700 font-semibold">Días con Clase</p>
                                            <p className="text-2xl font-bold text-purple-900">
                                                {new Set(miHorario.map(h => h.dia_sem)).size}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default HorariosTutorTab;
