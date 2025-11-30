import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, Save, Wand2, AlertCircle } from 'lucide-react';
import type { Semana } from '../../../types/semana';
import type { Periodo } from '../../../types/periodo';

// Helper para IDs
const generateId = (items: { id: number }[]): number =>
    items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

// Helper para sumar días a una fecha
const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export const ConfiguracionSemanas: React.FC = () => {
    // Mock de periodos (debería venir de props o contexto en app real)
    const [periodos] = useState<Periodo[]>([
        { id: 1, nombre: '2025-1', anio: 2025, fec_ini: '2025-01-20', fec_fin: '2025-06-15' },
        { id: 2, nombre: '2025-2', anio: 2025, fec_ini: '2025-07-15', fec_fin: '2025-12-01' },
    ]);

    const [semanas, setSemanas] = useState<Semana[]>([
        { id: 1, numero: 1, fecha_inicio: '2025-01-20', fecha_fin: '2025-01-26', id_periodo: 1, periodoNombre: '2025-1' },
        { id: 2, numero: 2, fecha_inicio: '2025-01-27', fecha_fin: '2025-02-02', id_periodo: 1, periodoNombre: '2025-1' },
    ]);

    const [selectedPeriodoId, setSelectedPeriodoId] = useState<number>(periodos[0]?.id || 0);
    const [generationConfig, setGenerationConfig] = useState({
        startDate: periodos[0]?.fec_ini || '',
        weeksCount: 16,
    });

    // Filtrar semanas por periodo seleccionado
    const semanasFiltradas = useMemo(() =>
        semanas.filter(s => s.id_periodo === selectedPeriodoId).sort((a, b) => a.numero - b.numero),
        [semanas, selectedPeriodoId]);

    const handleGenerarSemanas = () => {
        if (!selectedPeriodoId || !generationConfig.startDate) return;

        const periodo = periodos.find(p => p.id === selectedPeriodoId);
        if (!periodo) return;

        if (window.confirm(`¿Estás seguro de generar ${generationConfig.weeksCount} semanas? Esto reemplazará las semanas existentes para este periodo.`)) {
            // Eliminar semanas existentes del periodo
            const otrasSemanas = semanas.filter(s => s.id_periodo !== selectedPeriodoId);

            const nuevasSemanas: Semana[] = [];
            let currentDate = generationConfig.startDate;
            let currentId = generateId(semanas); // Empezar IDs desde el máximo actual

            for (let i = 1; i <= generationConfig.weeksCount; i++) {
                const endDate = addDays(currentDate, 6); // Semana de 7 días (Lunes a Domingo)

                nuevasSemanas.push({
                    id: currentId + i,
                    numero: i,
                    fecha_inicio: currentDate,
                    fecha_fin: endDate,
                    id_periodo: selectedPeriodoId,
                    periodoNombre: periodo.nombre
                });

                currentDate = addDays(endDate, 1); // Siguiente lunes
            }

            setSemanas([...otrasSemanas, ...nuevasSemanas]);
        }
    };

    const handleDeleteSemana = (id: number) => {
        if (window.confirm('¿Eliminar esta semana?')) {
            setSemanas(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleUpdateSemana = (id: number, field: keyof Semana, value: any) => {
        setSemanas(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <section className="space-y-8 animate-fadeIn">
            {/* Encabezado */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-100">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Calendario de Semanas</h2>
                    <p className="text-sm text-gray-500">
                        Configuración de semanas académicas por periodo
                    </p>
                </div>
            </div>

            {/* Panel de Generación */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Generador Automático
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                        <select
                            value={selectedPeriodoId}
                            onChange={(e) => {
                                const pid = Number(e.target.value);
                                setSelectedPeriodoId(pid);
                                const p = periodos.find(per => per.id === pid);
                                if (p) setGenerationConfig(prev => ({ ...prev, startDate: p.fec_ini }));
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio (Semana 1)</label>
                        <input
                            type="date"
                            value={generationConfig.startDate}
                            onChange={(e) => setGenerationConfig(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Semanas</label>
                        <input
                            type="number"
                            min="1"
                            max="52"
                            value={generationConfig.weeksCount}
                            onChange={(e) => setGenerationConfig(prev => ({ ...prev, weeksCount: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>

                    <button
                        onClick={handleGenerarSemanas}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                        <Wand2 className="w-4 h-4" />
                        Generar Semanas
                    </button>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-indigo-700 bg-indigo-100 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                        Al generar, se crearán semanas consecutivas de lunes a domingo a partir de la fecha de inicio.
                        Las semanas existentes para el periodo seleccionado serán reemplazadas.
                    </p>
                </div>
            </div>

            {/* Lista de Semanas */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"># Semana</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Fin</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {semanasFiltradas.length > 0 ? (
                                semanasFiltradas.map((semana) => (
                                    <tr key={semana.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            Semana {semana.numero}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="date"
                                                value={semana.fecha_inicio}
                                                onChange={(e) => handleUpdateSemana(semana.id, 'fecha_inicio', e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="date"
                                                value={semana.fecha_fin}
                                                onChange={(e) => handleUpdateSemana(semana.id, 'fecha_fin', e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteSemana(semana.id)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Eliminar semana"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        No hay semanas configuradas para este periodo. Usa el generador arriba.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};
