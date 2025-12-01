import React from 'react';
import type { Horario } from '../../../types/horario';
import type { AulaHorarioSemana } from '../../../types/aula-horario-semana';
import type { Aula } from '../../../types/aula';
import { Plus } from 'lucide-react';

interface CalendarViewProps {
    horarios: Horario[];
    assignments: AulaHorarioSemana[];
    aulas: Aula[];
    onSlotClick: (dia: string, horario: Horario) => void;
    onAssignmentClick: (assignment: AulaHorarioSemana) => void;
}

const DIAS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
const DIAS_LABEL: Record<string, string> = {
    LU: 'Lunes', MA: 'Martes', MI: 'Miércoles', JU: 'Jueves', VI: 'Viernes', SA: 'Sábado',
};

const CalendarView: React.FC<CalendarViewProps> = ({ horarios, assignments, aulas, onSlotClick, onAssignmentClick }) => {
    // Group horarios by day for column rendering
    const horariosByDay = DIAS.reduce((acc, dia) => {
        acc[dia] = horarios.filter(h => h.dia_sem === dia).sort((a, b) => a.hora_ini.localeCompare(b.hora_ini));
        return acc;
    }, {} as Record<string, Horario[]>);



    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {DIAS.map(dia => (
                <div key={dia} className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {/* Header del día */}
                    <div className="bg-gray-50 p-3 border-b border-gray-200 text-center">
                        <span className="font-bold text-gray-700 block">{DIAS_LABEL[dia]}</span>
                    </div>

                    {/* Slots de horarios */}
                    <div className="flex-1 p-2 space-y-2 min-h-[200px]">
                        {horariosByDay[dia]?.length > 0 ? (
                            horariosByDay[dia].map(horario => {
                                const slotAssignments = assignments.filter(a => a.id_horario === horario.id);

                                return (
                                    <div
                                        key={horario.id}
                                        className={`
                                            relative rounded-lg border text-sm transition-all group
                                            ${slotAssignments.length > 0
                                                ? 'bg-indigo-50 border-indigo-200'
                                                : 'bg-white border-dashed border-gray-300 hover:border-indigo-400 hover:bg-gray-50 cursor-pointer'
                                            }
                                        `}
                                        onClick={() => {
                                            if (slotAssignments.length === 0) {
                                                onSlotClick(dia, horario);
                                            }
                                        }}
                                    >
                                        <div className="p-2 border-b border-gray-100 last:border-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-mono text-xs font-semibold text-gray-500">
                                                    {horario.hora_ini.substring(0, 5)} - {horario.hora_fin.substring(0, 5)}
                                                </span>
                                            </div>

                                            {slotAssignments.length === 0 && (
                                                <div className="flex items-center justify-center h-6 text-gray-400 group-hover:text-indigo-500">
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Render assignments stacked */}
                                        {slotAssignments.map((assignment, idx) => {
                                            const aula = aulas.find(a => a.id === assignment.id_aula);
                                            return (
                                                <div
                                                    key={`${assignment.id_aula}-${assignment.id_horario}-${idx}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAssignmentClick(assignment);
                                                    }}
                                                    className="p-2 border-t border-indigo-100 hover:bg-indigo-100 cursor-pointer transition-colors first:border-t-0"
                                                >
                                                    <div className="text-indigo-700 font-bold">
                                                        Aula {aula?.grado}°{aula?.grupo}
                                                    </div>
                                                    {aula?.sedeNombre && (
                                                        <div className="text-xs text-indigo-600 mt-0.5">
                                                            {aula.sedeNombre}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Add button for slot with existing assignments? Optional, but kept simple for now as per user request to just see them */}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-xs italic">
                                Sin horarios
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CalendarView;
