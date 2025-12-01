import React, { useMemo, useState } from 'react';
import type { Aula } from '../../../types/aula';
import type { Horario } from '../../../types/horario';
import type { AulaHorario } from '../../../types/asignaciones';
import { Search, Plus, Clock3, CalendarDays, Edit2, Trash2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import AsignacionesForm from './AsignacionesForm';

// Helpers
const DIAS_LABEL: Record<string, string> = {
    LU: 'Lunes', MA: 'Martes', MI: 'Miércoles', JU: 'Jueves', VI: 'Viernes', SA: 'Sábado',
};

const duracionMinutos = (ini: string, fin: string) => {
    const [h1, m1] = ini.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    return h2 * 60 + m2 - (h1 * 60 + m1);
};

// Mock Data (To be replaced with real API calls later if needed, keeping as is for now)
const MOCK_AULAS: Aula[] = [
    { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
    { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
    { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
    { id: 4, grado: 10, grupo: 'A', id_sede: 3 },
];
const MOCK_HORARIOS: Horario[] = [
    { id: 1, dia_sem: 'LU', hora_ini: '07:00', hora_fin: '07:45' },
    { id: 2, dia_sem: 'LU', hora_ini: '07:45', hora_fin: '08:30' },
    { id: 3, dia_sem: 'MI', hora_ini: '10:00', hora_fin: '10:50' },
    { id: 4, dia_sem: 'SA', hora_ini: '08:00', hora_fin: '08:45' },
];
const MOCK_AULA_HORARIOS: AulaHorario[] = [
    { id: 1, id_aula: 1, id_horario: 1 },
    { id: 2, id_aula: 1, id_horario: 2 },
    { id: 3, id_aula: 3, id_horario: 3 },
    { id: 4, id_aula: 4, id_horario: 4 },
];

const AulaHorarioTab: React.FC = () => {
    const [aulas] = useState<Aula[]>(MOCK_AULAS);
    const [horarios] = useState<Horario[]>(MOCK_HORARIOS);
    const [aulaHorarios, setAulaHorarios] = useState<AulaHorario[]>(MOCK_AULA_HORARIOS);
    const [searchAulaHorario, setSearchAulaHorario] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<AulaHorario>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const aulaHorariosFiltrado = useMemo(() => {
        return aulaHorarios.filter((asig) => {
            const aula = aulas.find((a) => a.id === asig.id_aula);
            const horario = horarios.find((h) => h.id === asig.id_horario);
            const termino = searchAulaHorario.toLowerCase().trim();
            if (!termino) return true;
            const str = `${aula?.grado ?? ''}${aula?.grupo ?? ''} ${DIAS_LABEL[horario?.dia_sem ?? ''] ?? ''} ${horario?.hora_ini ?? ''}`;
            return str.toLowerCase().includes(termino);
        });
    }, [aulaHorarios, aulas, horarios, searchAulaHorario]);

    const openCreateForm = () => {
        setIsEditing(false);
        setFormError(null);
        setFormData({ id_aula: 0, id_horario: 0 });
        setIsFormOpen(true);
    };

    const openEditForm = (asig: AulaHorario) => {
        setIsEditing(true);
        setFormError(null);
        setFormData(asig);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setFormError(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.id_aula || !formData.id_horario) {
            setFormError('Todos los campos son obligatorios.');
            return;
        }
        setIsSubmitting(true);
        // Mock submit logic
        const payload: AulaHorario = {
            id: formData.id ?? -1,
            id_aula: formData.id_aula as number,
            id_horario: formData.id_horario as number,
        };

        if (isEditing && formData.id != null) {
            setAulaHorarios((prev) => prev.map((a) => (a.id === formData.id ? payload : a)));
        } else {
            const newId = aulaHorarios.length > 0 ? Math.max(...aulaHorarios.map((a) => a.id)) + 1 : 1;
            payload.id = newId;
            setAulaHorarios((prev) => [...prev, payload]);
        }
        setIsSubmitting(false);
        closeForm();
    };

    const handleDelete = (id: number) => {
        if (!window.confirm('¿Eliminar esta asignación Aula ↔ Horario?')) return;
        setAulaHorarios((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4 w-full">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-green-600" />
                            Sesiones
                        </CardTitle>
                        <CardDescription>Asignación de horarios a aulas</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                            <Clock3 className="w-5 h-5 text-green-600" />
                            Asignación Aula ↔ Horario
                        </h3>
                        <button
                            onClick={openCreateForm}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva asignación
                        </button>
                    </div>

                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por aula, día u hora..."
                            value={searchAulaHorario}
                            onChange={(e) => setSearchAulaHorario(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full">
                            <thead className="bg-green-50 border-b border-green-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Aula</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Día</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Hora inicio</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Hora fin</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Duración</th>
                                    <th className="px-4 py-2 text-center text-xs font-bold text-green-900 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {aulaHorariosFiltrado.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm italic">No hay asignaciones.</td></tr>
                                ) : (
                                    aulaHorariosFiltrado.map((asig) => {
                                        const aula = aulas.find((a) => a.id === asig.id_aula);
                                        const horario = horarios.find((h) => h.id === asig.id_horario);
                                        const mins = horario ? duracionMinutos(horario.hora_ini, horario.hora_fin) : 0;
                                        return (
                                            <tr key={asig.id} className="hover:bg-green-50 transition-colors">
                                                <td className="px-4 py-2 text-sm">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold">
                                                        Aula {aula?.grado}°{aula?.grupo}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-800">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {horario ? DIAS_LABEL[horario.dia_sem] : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm font-mono text-gray-900">{horario?.hora_ini ?? '—'}</td>
                                                <td className="px-4 py-2 text-sm font-mono text-gray-900">{horario?.hora_fin ?? '—'}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    {horario && <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">{mins} min</span>}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => openEditForm(asig)} className="p-2 hover:bg-amber-100 rounded-lg text-amber-600"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(asig.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {isFormOpen && (
                        <AsignacionesForm
                            mode="aula_horario"
                            isEditing={isEditing}
                            formData={formData}
                            aulas={aulas}
                            tutores={[]} // No needed for this mode
                            horarios={horarios}
                            formError={formError}
                            isSubmitting={isSubmitting}
                            onClose={closeForm}
                            onSubmit={handleSubmit}
                            onChange={handleFormChange}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default AulaHorarioTab;
