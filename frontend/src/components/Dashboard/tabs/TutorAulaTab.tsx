import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    History,
    ArrowRightLeft,
    Trash2,
    XCircle,
    UserPlus,
    Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { aulasService } from '../../../services/api/aulas.service';
import type { Aula, CambiarTutorDto } from '../../../services/api/aulas.service';
import { personalService } from '../../../services/api/personal.service';
import type { Personal } from '../../../types/personal';
import type { TutorAula } from '../../../types/asignaciones';

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Helper for date formatting - keep absolute date without timezone conversion
const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    // Just take the date part (YYYY-MM-DD) if it includes time
    return dateString.split('T')[0];
};

const TutorAulaTab: React.FC = () => {
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [tutores, setTutores] = useState<Personal[]>([]);
    const [tutoresActuales, setTutoresActuales] = useState<Record<number, TutorAula>>({});
    const [loading, setLoading] = useState(true);

    // Modal States
    const [modalType, setModalType] = useState<'asignar' | 'desasignar' | 'cambiar' | null>(null);
    const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
    const [selectedTutorId, setSelectedTutorId] = useState<number>(0);
    const [fechaAccion, setFechaAccion] = useState<string>(new Date().toISOString().slice(0, 10));
    const [processing, setProcessing] = useState(false);

    // History States
    const [showHistory, setShowHistory] = useState(false);
    const [historyMode, setHistoryMode] = useState<'aula' | 'tutor'>('aula');
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [searchHistory, setSearchHistory] = useState('');
    const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null); // Track selected item

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [aulasData, tutoresData] = await Promise.all([
                aulasService.getAll(),
                personalService.getTutores()
            ]);
            setAulas(aulasData);
            setTutores(tutoresData);

            // Fetch current tutors for each aula
            const currentTutorsMap: Record<number, TutorAula> = {};
            await Promise.all(aulasData.map(async (aula) => {
                try {
                    const tutoresAula = await aulasService.getTutoresHistorico(aula.id);
                    const actual = tutoresAula.find((t: any) => t.activo || t.fecha_desasignado === null);
                    if (actual) {
                        currentTutorsMap[aula.id] = actual;
                    }
                } catch (e) {
                    console.error(`Error fetching tutors for aula ${aula.id}`, e);
                }
            }));
            setTutoresActuales(currentTutorsMap);
        } catch (err) {
            console.error('Error al cargar los datos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedAula) return;
        setProcessing(true);
        try {
            if (modalType === 'asignar') {
                await aulasService.asignarTutor(selectedAula.id, selectedTutorId, fechaAccion);
            } else if (modalType === 'desasignar') {
                const currentTutor = tutoresActuales[selectedAula.id];
                if (currentTutor) {
                    await aulasService.desasignarTutor(selectedAula.id, currentTutor.id_tutor, fechaAccion);
                }
            } else if (modalType === 'cambiar') {
                const dto: CambiarTutorDto = {
                    id_tutor_nuevo: selectedTutorId,
                    fecha_cambio: fechaAccion
                };
                await aulasService.cambiarTutor(selectedAula.id, dto);
            }
            await fetchData(); // Refresh data
            closeModal();
        } catch (err: any) {
            console.error('Error:', err);
            // Error handled by api-client
        } finally {
            setProcessing(false);
        }
    };

    const openModal = (type: 'asignar' | 'desasignar' | 'cambiar', aula: Aula) => {
        setModalType(type);
        setSelectedAula(aula);
        setSelectedTutorId(0);
        setFechaAccion(new Date().toISOString().slice(0, 10));
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedAula(null);
        setSelectedTutorId(0);
    };

    const fetchHistory = async (id: number, mode: 'aula' | 'tutor') => {
        try {
            setLoading(true);
            setSelectedHistoryId(id); // Set selected
            let data = [];
            if (mode === 'aula') {
                data = await aulasService.getTutoresHistorico(id);
            } else {
                data = await aulasService.getHistoricoPorTutor(id);
            }
            console.log('History data received:', data); // Debug log
            setHistoryData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filtered Lists
    const filteredAulas = useMemo(() => {
        if (historyMode === 'aula' && showHistory && searchHistory) {
            return aulas.filter(a => `Aula ${a.grado}°${a.grupo} `.toLowerCase().includes(searchHistory.toLowerCase()));
        }
        return aulas;
    }, [aulas, historyMode, showHistory, searchHistory]);

    const filteredTutores = useMemo(() => {
        if (historyMode === 'tutor' && showHistory && searchHistory) {
            return tutores.filter(t => `${t.nombre} ${t.apellido || ''} `.toLowerCase().includes(searchHistory.toLowerCase()));
        }
        return tutores;
    }, [tutores, historyMode, showHistory, searchHistory]);

    if (loading && !aulas.length) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-gray-600">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    Cargando...
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4 w-full">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-6 h-6 text-green-600" />
                            Tutores
                        </CardTitle>
                        <CardDescription>Gestión de asignaciones tutor-aula</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Gestión Tutor-Aula</h2>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${showHistory ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <History className="w-4 h-4" />
                            {showHistory ? 'Ver Gestión Actual' : 'Ver Históricos'}
                        </button>
                    </div>

                    {!showHistory ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {aulas.map((aula) => {
                                const tutorActual = tutoresActuales[aula.id];
                                const tutorInfo = tutorActual ? tutores.find(t => t.id === tutorActual.id_tutor) : null;

                                return (
                                    <div key={aula.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all hover:border-green-300">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Aula {aula.grado}°{aula.grupo}</h3>
                                                <p className="text-xs text-gray-500">{aula.sedeNombre || 'Sede Principal'}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${tutorActual ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {tutorActual ? 'Asignado' : 'Sin Tutor'}
                                            </span>
                                        </div>
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Tutor Actual:</p>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {tutorInfo ? `${tutorInfo.nombre} ${tutorInfo.apellido || ''} ` : '—'}
                                            </p>
                                            {tutorActual && (
                                                <p className="text-xs text-gray-400 mt-1">Desde: {formatDate(tutorActual.fecha_asignado)}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {!tutorActual ? (
                                                <button
                                                    onClick={() => openModal('asignar', aula)}
                                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <UserPlus className="w-4 h-4" /> Asignar
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openModal('cambiar', aula)}
                                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        <ArrowRightLeft className="w-4 h-4" /> Cambiar
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('desasignar', aula)}
                                                        className="flex-1 bg-white hover:bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border-2 border-red-200 hover:border-red-300 transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Desasignar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex gap-4 border-b-2 border-gray-200 pb-4">
                                <button
                                    onClick={() => { setHistoryMode('aula'); setHistoryData([]); setSelectedHistoryId(null); }}
                                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${historyMode === 'aula' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 border-2 border-gray-200'}`}
                                >
                                    Por Aula
                                </button>
                                <button
                                    onClick={() => { setHistoryMode('tutor'); setHistoryData([]); setSelectedHistoryId(null); }}
                                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${historyMode === 'tutor' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 border-2 border-gray-200'}`}
                                >
                                    Por Tutor
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/3 space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder={`Buscar ${historyMode}...`}
                                            value={searchHistory}
                                            onChange={(e) => setSearchHistory(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
                                        />
                                    </div>
                                    <div className="border-2 border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                                        {historyMode === 'aula' ? (
                                            filteredAulas.map(aula => (
                                                <div
                                                    key={aula.id}
                                                    onClick={() => fetchHistory(aula.id, 'aula')}
                                                    className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all ${selectedHistoryId === aula.id ? 'bg-green-50 border-l-4 border-l-green-600' : 'hover:bg-gray-50'}`}
                                                >
                                                    <p className={`font-semibold ${selectedHistoryId === aula.id ? 'text-green-800' : 'text-gray-900'}`}>Aula {aula.grado}°{aula.grupo}</p>
                                                    <p className="text-xs text-gray-500">{aula.sedeNombre}</p>
                                                </div>
                                            ))
                                        ) : (
                                            filteredTutores.map(tutor => (
                                                <div
                                                    key={tutor.id}
                                                    onClick={() => fetchHistory(tutor.id, 'tutor')}
                                                    className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all ${selectedHistoryId === tutor.id ? 'bg-green-50 border-l-4 border-l-green-600' : 'hover:bg-gray-50'}`}
                                                >
                                                    <p className={`font-semibold ${selectedHistoryId === tutor.id ? 'text-green-800' : 'text-gray-900'}`}>{tutor.nombre} {tutor.apellido || ''}</p>
                                                    <p className="text-xs text-gray-500">{tutor.codigo}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="w-2/3 border-2 border-gray-200 rounded-lg p-4 bg-white">
                                    <h3 className="font-bold text-lg mb-4 text-gray-800">Resultados del Histórico</h3>
                                    {historyData.length === 0 ? (
                                        <p className="text-gray-500 italic text-center py-8">Selecciona un elemento para ver su historial.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                                                    <tr>
                                                        <th className="p-3 text-left text-xs font-bold text-green-900 uppercase">Fecha Inicio</th>
                                                        <th className="p-3 text-left text-xs font-bold text-green-900 uppercase">Fecha Fin</th>
                                                        <th className="p-3 text-left text-xs font-bold text-green-900 uppercase">{historyMode === 'aula' ? 'Tutor' : 'Aula'}</th>
                                                        <th className="p-3 text-left text-xs font-bold text-green-900 uppercase">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {historyData.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition-colors">
                                                            <td className="p-3 text-gray-900">{formatDate(item.fecha_asignado)}</td>
                                                            <td className="p-3 text-gray-900">{formatDate(item.fecha_desasignado)}</td>
                                                            <td className="p-3 text-gray-900">
                                                                {historyMode === 'aula'
                                                                    ? `${item.nombre || ''} ${item.apellido || ''} `.trim() || `[ID: ${item.id_tutor}]`
                                                                    : `Aula ${aulas.find(a => a.id === item.id_aula)?.grado}°${aulas.find(a => a.id === item.id_aula)?.grupo} `
                                                                }
                                                            </td>
                                                            <td className="p-3">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.fecha_desasignado ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'}`}>
                                                                    {item.fecha_desasignado ? 'Inactivo' : 'Activo'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de Acción */}
                    <Modal
                        isOpen={!!modalType}
                        onClose={closeModal}
                        title={
                            modalType === 'asignar' ? 'Asignar Tutor' :
                                modalType === 'desasignar' ? 'Desasignar Tutor' :
                                    'Cambiar Tutor'
                        }
                    >
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                {modalType === 'asignar' && `Selecciona el tutor para el Aula ${selectedAula?.grado}°${selectedAula?.grupo}.`}
                                {modalType === 'desasignar' && `¿Estás seguro de desasignar al tutor actual del Aula ${selectedAula?.grado}°${selectedAula?.grupo}?`}
                                {modalType === 'cambiar' && `Selecciona el NUEVO tutor para el Aula ${selectedAula?.grado}°${selectedAula?.grupo}. El actual será desasignado automáticamente.`}
                            </p>

                            {(modalType === 'asignar' || modalType === 'cambiar') && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tutor *</label>
                                    <select
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                                        value={selectedTutorId}
                                        onChange={(e) => setSelectedTutorId(Number(e.target.value))}
                                    >
                                        <option value={0}>Seleccione un tutor...</option>
                                        {tutores.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre} {t.apellido || ''}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Acción *</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
                                    value={fechaAccion}
                                    onChange={(e) => setFechaAccion(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={processing || ((modalType === 'asignar' || modalType === 'cambiar') && !selectedTutorId)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Procesando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </CardContent>
        </Card>
    );
};

export default TutorAulaTab;
