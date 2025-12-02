import React, { useState, useEffect } from 'react';
import { Calendar, Wand2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Semana } from '../../../types/semana';
import type { Periodo } from '../../../types/periodo';
import { periodosService } from '../../../services/api/periodos.service';

export const ConfiguracionSemanas: React.FC = () => {
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [semanas, setSemanas] = useState<Semana[]>([]);
    const [selectedPeriodoId, setSelectedPeriodoId] = useState<number>(0);
    const [generationConfig, setGenerationConfig] = useState({
        startDate: new Date().toISOString().split('T')[0],
        weeksCount: 16,
    });

    useEffect(() => {
        loadPeriodos();

        // Listen for changes from other components
        const handlePeriodosChange = () => {
            loadPeriodos();
        };

        window.addEventListener('periodos-updated', handlePeriodosChange);

        return () => {
            window.removeEventListener('periodos-updated', handlePeriodosChange);
        };
    }, []);

    useEffect(() => {
        if (selectedPeriodoId) {
            loadSemanas(selectedPeriodoId);
        } else {
            setSemanas([]);
        }
    }, [selectedPeriodoId]);

    const loadPeriodos = async () => {
        try {
            const data = await periodosService.getAll();
            setPeriodos(data);
            if (data.length > 0 && !selectedPeriodoId) {
                setSelectedPeriodoId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading periodos', error);
        }
    };

    const loadSemanas = async (id: number) => {
        try {
            const data = await periodosService.getSemanasByPeriodo(id);
            // Sort by id or date just in case
            setSemanas(data.sort((a, b) => new Date(a.fec_ini).getTime() - new Date(b.fec_ini).getTime()));
        } catch (error) {
            console.error('Error loading semanas', error);
            setSemanas([]);
        }
    };

    const handleGenerarSemanas = async () => {
        if (!selectedPeriodoId || !generationConfig.startDate) return;

        // Prevent generation if weeks already exist (per enunciado.txt: calendar created only once)
        if (semanas.length > 0) {
            toast.error('Este periodo ya tiene semanas generadas. No se puede generar nuevamente.');
            return;
        }

        if (window.confirm(`¿Estás seguro de generar ${generationConfig.weeksCount} semanas?`)) {
            try {
                await periodosService.generarSemanas(selectedPeriodoId, {
                    fec_ini: generationConfig.startDate,
                    cantidad_semanas: generationConfig.weeksCount
                });

                toast.success('Semanas generadas exitosamente');
                loadSemanas(selectedPeriodoId);
                // Notify other components
                window.dispatchEvent(new CustomEvent('semanas-updated'));
            } catch (error) {
                console.error('Error generating semanas', error);
            }
        }
    };

    const getPeriodoNombre = (p: Periodo) => `${p.anho}-${p.numero}`;

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
                            onChange={(e) => setSelectedPeriodoId(Number(e.target.value))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>{getPeriodoNombre(p)}</option>
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
                        disabled={semanas.length > 0}
                        className={`px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2 ${semanas.length > 0
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        <Wand2 className="w-4 h-4" />
                        Generar Semanas
                    </button>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-indigo-700 bg-indigo-100 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                        {semanas.length > 0
                            ? 'Este periodo ya tiene semanas generadas. El calendario solo se puede crear una vez por periodo.'
                            : 'Al generar, se crearán semanas consecutivas de lunes a domingo a partir de la fecha de inicio. El calendario solo se puede crear una vez por periodo.'
                        }
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {semanas.length > 0 ? (
                                semanas.map((semana, index) => (
                                    <tr key={semana.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            Semana {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {semana.fec_ini.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {semana.fec_fin.split('T')[0]}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
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
