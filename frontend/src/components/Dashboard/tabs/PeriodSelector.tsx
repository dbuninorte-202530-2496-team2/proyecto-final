import React from 'react';
import type { Periodo } from '../../../types/periodo';
import { Calendar } from 'lucide-react';

interface PeriodSelectorProps {
    periodos: Periodo[];
    selectedPeriodoId: number;
    onSelect: (id: number) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ periodos, selectedPeriodoId, onSelect }) => {
    return (
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="p-2 rounded-lg bg-indigo-50">
                <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Periodo Académico</label>
                <select
                    value={selectedPeriodoId}
                    onChange={(e) => onSelect(Number(e.target.value))}
                    className="w-full bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
                >
                    {periodos.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.anho}-{p.numero}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default PeriodSelector;
