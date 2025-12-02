import React, { useMemo, useState, useEffect } from 'react';
import type { Aula } from '../../../types/aula';
import type { Horario } from '../../../types/horario';
import type { AulaHorarioSemana } from '../../../types/aula-horario-semana';
import type { Periodo } from '../../../types/periodo';
import type { Semana } from '../../../types/semana';
import { Calendar, Clock3, Plus, School } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import AsignacionesForm from './AsignacionesForm';
import PeriodSelector from './PeriodSelector';
import WeekSelector from './WeekSelector';
import CalendarView from './CalendarView';
import { toast } from 'sonner';
import apiClient from '../../../services/api/api-client';

const AulaHorarioTab: React.FC = () => {
    // Data state
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [horarios, setHorarios] = useState<Horario[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [semanas, setSemanas] = useState<Semana[]>([]);
    const [assignments, setAssignments] = useState<AulaHorarioSemana[]>([]);

    // Selection state
    const [selectedPeriodoId, setSelectedPeriodoId] = useState<number>(0);
    const [selectedSemanaId, setSelectedSemanaId] = useState<number>(0);
    const [selectedInstitucionNombre, setSelectedInstitucionNombre] = useState<string>('');
    const [selectedAulaId, setSelectedAulaId] = useState<number>(0);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<AulaHorarioSemana & { applyToPeriod?: boolean }>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Loading states
    const [isLoadingPeriodos, setIsLoadingPeriodos] = useState(false);
    const [isLoadingSemanas, setIsLoadingSemanas] = useState(false);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

    // Fetch periods on mount
    useEffect(() => {
        const fetchPeriodos = async () => {
            setIsLoadingPeriodos(true);
            try {
                const response = await apiClient.get('/periodos');
                setPeriodos(response.data);
                if (response.data.length > 0) {
                    setSelectedPeriodoId(response.data[0].id);
                }
            } catch (error) {
                toast.error('Error al cargar periodos');
                console.error(error);
            } finally {
                setIsLoadingPeriodos(false);
            }
        };
        fetchPeriodos();
    }, []);

    // Fetch aulas and horarios on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aulasRes, horariosRes] = await Promise.all([
                    apiClient.get('/aulas'),
                    apiClient.get('/horario')  // Controller uses singular 'horario'
                ]);
                // Map backend snake_case to camelCase
                const aulasWithCamelCase = aulasRes.data.map((aula: any) => ({
                    ...aula,
                    sedeNombre: aula.sede_nombre,
                    institucionNombre: aula.institucion_nombre,
                }));
                setAulas(aulasWithCamelCase);

                // Set initial institution if available
                if (aulasWithCamelCase.length > 0) {
                    const firstInst = aulasWithCamelCase[0].institucionNombre;
                    if (firstInst) setSelectedInstitucionNombre(firstInst);
                }

                setHorarios(horariosRes.data);
            } catch (error) {
                toast.error('Error al cargar datos');
                console.error(error);
            }
        };
        fetchData();
    }, []);

    // Fetch semanas when selectedPeriodoId changes
    useEffect(() => {
        if (selectedPeriodoId) {
            const fetchSemanas = async () => {
                setIsLoadingSemanas(true);
                try {
                    const response = await apiClient.get(`/periodos/${selectedPeriodoId}/semanas`);
                    setSemanas(response.data);
                } catch (error) {
                    toast.error('Error al cargar semanas');
                    console.error(error);
                } finally {
                    setIsLoadingSemanas(false);
                }
            };
            fetchSemanas();
        } else {
            setSemanas([]);
        }
    }, [selectedPeriodoId]);

    // Fetch assignments when selectedSemanaId changes
    useEffect(() => {
        if (selectedSemanaId) {
            const fetchAssignments = async () => {
                setIsLoadingAssignments(true);
                try {
                    const response = await apiClient.get(`/semanas/${selectedSemanaId}/aulas-horarios`);
                    setAssignments(response.data);
                } catch (error) {
                    toast.error('Error al cargar asignaciones');
                    console.error(error);
                } finally {
                    setIsLoadingAssignments(false);
                }
            };
            fetchAssignments();
        } else {
            setAssignments([]);
        }
    }, [selectedSemanaId]);

    // Filtered Data
    const semanasDelPeriodo = useMemo(() =>
        semanas.filter(s => s.id_periodo === selectedPeriodoId).sort((a, b) => new Date(a.fec_ini).getTime() - new Date(b.fec_ini).getTime()),
        [semanas, selectedPeriodoId]
    );

    // Unique Institutions
    const instituciones = useMemo(() => {
        const insts = new Set<string>();
        aulas.forEach(a => {
            if (a.institucionNombre) insts.add(a.institucionNombre);
        });
        return Array.from(insts).sort();
    }, [aulas]);

    // Filtered Aulas by Institution
    const aulasFiltradas = useMemo(() => {
        if (!selectedInstitucionNombre) return aulas;
        return aulas.filter(a => a.institucionNombre === selectedInstitucionNombre);
    }, [aulas, selectedInstitucionNombre]);

    // Auto-select first week when period changes
    useEffect(() => {
        if (semanasDelPeriodo.length > 0) {
            setSelectedSemanaId(semanasDelPeriodo[0].id);
        } else {
            setSelectedSemanaId(0);
        }
    }, [selectedPeriodoId, semanasDelPeriodo]);

    const currentAssignments = useMemo(() =>
        assignments.filter(a => {
            const matchesWeek = a.id_semana === selectedSemanaId;
            const matchesAula = selectedAulaId === 0 || a.id_aula === selectedAulaId;
            // Also filter by institution if selected (check if aula is in aulasFiltradas)
            const matchesInstitution = selectedInstitucionNombre
                ? aulasFiltradas.some(aula => aula.id === a.id_aula)
                : true;
            return matchesWeek && matchesAula && matchesInstitution;
        }),
        [assignments, selectedSemanaId, selectedAulaId, selectedInstitucionNombre, aulasFiltradas]
    );

    // Handlers
    const handleSlotClick = (_dia: string, horario: Horario) => {
        if (!selectedSemanaId) {
            toast.error('Selecciona una semana primero');
            return;
        }
        setIsEditing(false);
        setFormError(null);
        setFormData({
            id_horario: horario.id,
            id_semana: selectedSemanaId,
            id_aula: selectedAulaId !== 0 ? selectedAulaId : undefined, // Pre-fill aula if selected
            applyToPeriod: false
        });
        setIsFormOpen(true);
    };

    const handleAssignmentClick = (assignment: AulaHorarioSemana) => {
        setIsEditing(true);
        setFormError(null);
        setFormData({ ...assignment, applyToPeriod: false });
        setIsFormOpen(true);
    };

    const handleDelete = async (assignment: AulaHorarioSemana) => {
        if (!window.confirm('¿Eliminar esta asignación?')) return;

        try {
            await apiClient.delete(`/aulas/${assignment.id_aula}/horarios/${assignment.id_horario}/${assignment.id_semana}`);
            // Refresh assignments
            const response = await apiClient.get(`/semanas/${selectedSemanaId}/aulas-horarios`);
            setAssignments(response.data);
        } catch (error) {
            console.error('Error al eliminar asignación:', error);
        }
    };

    const openCreateForm = () => {
        if (!selectedSemanaId) {
            toast.error('Selecciona una semana primero');
            return;
        }
        setIsEditing(false);
        setFormError(null);
        setFormData({
            id_semana: selectedSemanaId,
            id_aula: selectedAulaId !== 0 ? selectedAulaId : undefined, // Pre-fill aula if selected
            applyToPeriod: false
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setFormError(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.id_aula || !formData.id_horario || !formData.id_semana) {
            setFormError('Todos los campos son obligatorios.');
            return;
        }
        setIsSubmitting(true);

        try {
            if (formData.applyToPeriod) {
                // Bulk Assignment - POST /aulas/:id_aula/horarios/bulk
                await apiClient.post(`/aulas/${formData.id_aula}/horarios/bulk`, {
                    id_horario: formData.id_horario,
                    id_periodo: selectedPeriodoId,
                });
                // Refresh assignments for current week
                const response = await apiClient.get(`/semanas/${selectedSemanaId}/aulas-horarios`);
                setAssignments(response.data);
            } else {
                // Single Assignment - POST /aulas/:id_aula/horarios
                await apiClient.post(`/aulas/${formData.id_aula}/horarios`, {
                    id_horario: formData.id_horario,
                    id_semana: formData.id_semana,
                });
                // Refresh assignments for current week
                const response = await apiClient.get(`/semanas/${selectedSemanaId}/aulas-horarios`);
                setAssignments(response.data);
            }
            closeForm();
        } catch (error) {
            console.error('Error al crear asignación:', error);
            // Error is already handled by apiClient interceptor
        } finally {
            setIsSubmitting(false);
        }
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
                        <CardDescription>Programación semanal de aulas</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Selectors Grid - 4 columns for better alignment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <PeriodSelector
                            periodos={periodos}
                            selectedPeriodoId={selectedPeriodoId}
                            onSelect={setSelectedPeriodoId}
                        />

                        {/* Institution Selector */}
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <School className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Institución</label>
                                <select
                                    value={selectedInstitucionNombre}
                                    onChange={(e) => {
                                        setSelectedInstitucionNombre(e.target.value);
                                        setSelectedAulaId(0); // Reset aula selection
                                    }}
                                    className="w-full bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer truncate"
                                >
                                    <option value="">Todas las instituciones</option>
                                    {instituciones.map((inst) => (
                                        <option key={inst} value={inst}>
                                            {inst}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Aula Selector */}
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-2 rounded-lg bg-orange-50">
                                <School className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar por Aula</label>
                                <select
                                    value={selectedAulaId}
                                    onChange={(e) => setSelectedAulaId(Number(e.target.value))}
                                    className="w-full bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer truncate"
                                >
                                    <option value={0}>Todas las aulas</option>
                                    {aulasFiltradas.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.grado}°{a.grupo}{a.sedeNombre ? ` - ${a.sedeNombre}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <WeekSelector
                            semanas={semanasDelPeriodo}
                            selectedSemanaId={selectedSemanaId}
                            onSelect={setSelectedSemanaId}
                        />
                    </div>

                    {/* Actions & Calendar */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                                <Clock3 className="w-5 h-5 text-green-600" />
                                Horario Semanal
                            </h3>
                            <button
                                onClick={openCreateForm}
                                disabled={!selectedSemanaId}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva sesión
                            </button>
                        </div>

                        {selectedSemanaId ? (
                            <CalendarView
                                horarios={horarios}
                                assignments={currentAssignments}
                                aulas={aulas}
                                onSlotClick={handleSlotClick}
                                onAssignmentClick={handleAssignmentClick}
                                weekStartDate={semanasDelPeriodo.find(s => s.id === selectedSemanaId)?.fec_ini || ''}
                            />
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                                Selecciona un periodo y una semana para ver el calendario.
                            </div>
                        )}
                    </div>

                    {isFormOpen && (
                        <AsignacionesForm
                            mode="aula_horario"
                            isEditing={isEditing}
                            formData={formData}
                            aulas={aulas} // Pass all aulas, filtering will be handled inside the form
                            tutores={[]}
                            horarios={horarios}
                            formError={formError}
                            isSubmitting={isSubmitting}
                            onClose={closeForm}
                            onSubmit={handleSubmit}
                            onDelete={() => {
                                if (formData.id_horario && formData.id_semana && formData.id_aula) {
                                    handleDelete(formData as AulaHorarioSemana);
                                    closeForm();
                                }
                            }}
                            onChange={handleFormChange}
                        />
                    )}
                </div>
            </CardContent>
        </Card >
    );
};

export default AulaHorarioTab;
