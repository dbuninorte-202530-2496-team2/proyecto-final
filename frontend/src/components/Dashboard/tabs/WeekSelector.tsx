import React from 'react';
import type { Semana } from '../../../types/semana';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface WeekSelectorProps {
    semanas: Semana[];
    selectedSemanaId: number;
    onSelect: (id: number) => void;
}

const formatDate = (dateString: string) => {
    // Extract YYYY-MM-DD from ISO string or date
    return dateString.split('T')[0];
};

const WeekSelector: React.FC<WeekSelectorProps> = ({ semanas, selectedSemanaId, onSelect }) => {
    const currentIndex = semanas.findIndex(s => s.id === selectedSemanaId);
    const selectedSemana = semanas[currentIndex];

    const goToPrevious = () => {
        if (currentIndex > 0) {
            onSelect(semanas[currentIndex - 1].id);
        }
    };

    const goToNext = () => {
        if (currentIndex < semanas.length - 1) {
            onSelect(semanas[currentIndex + 1].id);
        }
    };

    if (!selectedSemana || semanas.length === 0) {
        return (
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="p-2 rounded-lg bg-indigo-50">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Semana</label>
                    <p className="text-sm text-gray-400">No hay semanas disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center px-2 flex-1">
                <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    Semana {currentIndex + 1}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                    {formatDate(selectedSemana.fec_ini)} - {formatDate(selectedSemana.fec_fin)}
                </div>
            </div>

            <button
                onClick={goToNext}
                disabled={currentIndex >= semanas.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
};

export default WeekSelector;
