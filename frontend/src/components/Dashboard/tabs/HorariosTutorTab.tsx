import React, { useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { Horario } from '../../../types/horario';
import type { TutorAula, AulaHorario } from '../../../types/asignaciones';
import type { Aula } from '../../../types/aula';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '../../ui/Card';
import { Clock3, CalendarDays, BookOpen } from 'lucide-react';

const DIAS_LABEL: Record<string, string> = {
    LU: 'Lunes',
    MA: 'Martes',
    MI: 'Miércoles',
    JU: 'Jueves',
    VI: 'Viernes',
    SA: 'Sábado',
};

// Datos de prueba (deberían venir del backend)
const MOCK_HORARIOS: Horario[] = [
    { id: 1, dia_sem: 'LU', hora_ini: '07:00', hora_fin: '07:45' },
    { id: 2, dia_sem: 'LU', hora_ini: '07:45', hora_fin: '08:30' },
    { id: 3, dia_sem: 'MI', hora_ini: '10:00', hora_fin: '10:50' },
    { id: 4, dia_sem: 'SA', hora_ini: '08:00', hora_fin: '08:45' },
];

const MOCK_AULAS: Aula[] = [
    { id: 1, grado: 4, grupo: 'A', id_sede: 1, sedeNombre: 'Sede Norte', institucionNombre: 'Colegio San José' },
    { id: 2, grado: 5, grupo: 'B', id_sede: 1, sedeNombre: 'Sede Norte', institucionNombre: 'Colegio San José' },
    { id: 3, grado: 9, grupo: 'A', id_sede: 2, sedeNombre: 'Sede Sur', institucionNombre: 'Colegio María' },
    { id: 4, grado: 10, grupo: 'C', id_sede: 2, sedeNombre: 'Sede Sur', institucionNombre: 'Colegio María' },
];

const MOCK_TUTOR_AULA: TutorAula[] = [
    { id: 1, id_aula: 1, id_tutor: 1, fecha_asignado: '2025-02-01', fecha_desasignado: null },
    { id: 2, id_aula: 3, id_tutor: 3, fecha_asignado: '2025-02-10', fecha_desasignado: null },
];

const MOCK_AULA_HORARIO: AulaHorario[] = [
    { id: 1, id_aula: 1, id_horario: 1 },
    { id: 2, id_aula: 1, id_horario: 2 },
    { id: 3, id_aula: 3, id_horario: 3 },
    { id: 4, id_aula: 4, id_horario: 4 },
];

const HorariosTutorTab: React.FC = () => {
    const { usuario } = useAuth();

    // Obtener las aulas asignadas al tutor actual
    const aulasDelTutor = useMemo(() => {
        if (!usuario) return [];

        // Filtrar las asignaciones activas del tutor
        const asignacionesActivas = MOCK_TUTOR_AULA.filter(
            (ta) => ta.id_tutor === usuario.id && !ta.fecha_desasignado
        );

        // Obtener los IDs de las aulas
        const idsAulas = asignacionesActivas.map((ta) => ta.id_aula);

        // Retornar las aulas completas
        return MOCK_AULAS.filter((aula) => idsAulas.includes(aula.id));
    }, [usuario]);

    // Obtener los horarios de las aulas del tutor
    const horariosDelTutor = useMemo(() => {
        const idsAulas = aulasDelTutor.map((a) => a.id);

        // Obtener las relaciones aula-horario
        const aulaHorarios = MOCK_AULA_HORARIO.filter((ah) =>
            idsAulas.includes(ah.id_aula)
        );

        // Mapear a horarios completos con información del aula
        return aulaHorarios.map((ah) => {
            const horario = MOCK_HORARIOS.find((h) => h.id === ah.id_horario);
            const aula = aulasDelTutor.find((a) => a.id === ah.id_aula);

            return {
                ...horario!,
                aula: aula,
                aulaHorarioId: ah.id,
            };
        }).filter((h) => h.dia_sem); // Filtrar los que no tienen horario
    }, [aulasDelTutor]);

    // Agrupar horarios por día
    const horariosPorDia = useMemo(() => {
        const grupos: Record<string, typeof horariosDelTutor> = {
            LU: [],
            MA: [],
            MI: [],
            JU: [],
            VI: [],
            SA: [],
        };

        horariosDelTutor.forEach((h) => {
            if (grupos[h.dia_sem]) {
                grupos[h.dia_sem].push(h);
            }
        });

        // Ordenar cada día por hora de inicio
        Object.keys(grupos).forEach((dia) => {
            grupos[dia].sort((a, b) => a.hora_ini.localeCompare(b.hora_ini));
        });

        return grupos;
    }, [horariosDelTutor]);

    const totalHorarios = horariosDelTutor.length;
    const totalAulas = aulasDelTutor.length;

    if (!usuario) {
        return (
            <Card>
                <CardContent>
                    <div className="py-12 text-center text-gray-500">
                        No se pudo cargar la información del usuario.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4 w-full">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock3 className="w-6 h-6 text-green-600" />
                            Mi Horario
                        </CardTitle>
                        <CardDescription>
                            Horarios de las aulas asignadas a {usuario.nombres} {usuario.apellidos}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-600 font-semibold">
                                    Aulas asignadas
                                </p>
                                <p className="text-2xl font-bold text-emerald-900">
                                    {totalAulas}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center">
                                <Clock3 className="w-6 h-6 text-sky-700" />
                            </div>
                            <div>
                                <p className="text-sm text-sky-600 font-semibold">
                                    Bloques de horario
                                </p>
                                <p className="text-2xl font-bold text-sky-900">
                                    {totalHorarios}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horarios por día */}
                {totalHorarios === 0 ? (
                    <div className="py-12 text-center text-gray-500 italic border-2 border-dashed border-gray-300 rounded-lg">
                        No tienes horarios asignados actualmente.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(horariosPorDia).map(([dia, horarios]) => {
                            if (horarios.length === 0) return null;

                            return (
                                <div key={dia} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-white" />
                                        <h3 className="text-lg font-bold text-white">
                                            {DIAS_LABEL[dia]}
                                        </h3>
                                        <span className="ml-auto bg-white text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {horarios.length} {horarios.length === 1 ? 'clase' : 'clases'}
                                        </span>
                                    </div>

                                    <div className="divide-y divide-gray-200">
                                        {horarios.map((h) => (
                                            <div
                                                key={h.aulaHorarioId}
                                                className="p-4 hover:bg-green-50 transition-colors"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center border-2 border-green-300">
                                                            <Clock3 className="w-8 h-8 text-green-700" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-bold text-gray-900 font-mono">
                                                                {h.hora_ini} - {h.hora_fin}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {Math.floor(
                                                                    (new Date(`2000-01-01T${h.hora_fin}`).getTime() -
                                                                        new Date(`2000-01-01T${h.hora_ini}`).getTime()) /
                                                                    60000
                                                                )}{' '}
                                                                minutos
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {h.aula && (
                                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                                            <div>
                                                                <p className="text-sm font-bold text-blue-900">
                                                                    Grado {h.aula.grado} - Grupo {h.aula.grupo}
                                                                </p>
                                                                <p className="text-xs text-blue-600">
                                                                    {h.aula.sedeNombre}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default HorariosTutorTab;
