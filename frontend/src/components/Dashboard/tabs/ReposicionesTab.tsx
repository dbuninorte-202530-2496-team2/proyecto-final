import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Calendar, Plus, Edit2, Trash2, Search, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import type { AsistenciaTutor, AsistenciaTutorFormData } from '../../../types/asistenciaTutor';
import type { Horario } from '../../../types/horario';
import type { Aula } from '../../../types/aula';
import type { Motivo } from '../../../types/registroClases';
import type { Personal } from '../../../types/personal';

// Helper para IDs
const generateId = (items: { id: number }[]): number =>
  items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

const hoyISO = (): string => new Date().toISOString().split('T')[0];

// Tipos provicionales para mock
interface AulaHorario {
  id: number;
  id_aula: number;
  id_horario: number;
}

interface TutorAula {
  id: number;
  id_tutor: number;
  id_aula: number;
  fecha_inicio: string;
  fecha_fin: string | null;
}

// Mock Data
const mockTutores: Personal[] = [
  {
    id: 1,
    nombres: 'Laura',
    apellidos: 'Rodríguez',
    correo: 'laura.rod@globalenglish.edu.co',
    telefono: '3002223344',
    tipo_doc: 1,
    num_doc: '1012345678',
    id_rol: 3,
  },
  {
    id: 2,
    nombres: 'Carlos',
    apellidos: 'Martínez',
    correo: 'carlos.mtz@globalenglish.edu.co',
    telefono: '3003334455',
    tipo_doc: 1,
    num_doc: '1009876543',
    id_rol: 3,
  },
];

const mockAulaHorario: AulaHorario[] = [
  { id: 1, id_aula: 1, id_horario: 1 }, // Aula 5A - Lunes 08:00-10:00
  { id: 2, id_aula: 1, id_horario: 2 }, // Aula 5A - Miércoles 10:00-12:00
  { id: 3, id_aula: 1, id_horario: 3 }, // Aula 5A - Viernes 14:00-16:00
];

const mockTutorAula: TutorAula[] = [
  { id: 1, id_tutor: 1, id_aula: 1, fecha_inicio: '2025-01-01', fecha_fin: null }, // Laura en Aula 5A
  { id: 2, id_tutor: 2, id_aula: 1, fecha_inicio: '2025-01-01', fecha_fin: null }, // Carlos en Aula 5A
];

const mockHorarios: Horario[] = [
  { id: 1, dia_sem: 'LU', hora_ini: '08:00', hora_fin: '10:00' },
  { id: 2, dia_sem: 'MI', hora_ini: '10:00', hora_fin: '12:00' },
  { id: 3, dia_sem: 'VI', hora_ini: '14:00', hora_fin: '16:00' },
];

const mockAulas: Aula[] = [
  { id: 1, grado: 5, grupo: 'A', id_sede: 1, sedeNombre: 'Sede Principal', institucionNombre: 'IED San José' },
];

const mockMotivos: Motivo[] = [
  { id: 1, descripcion: 'Enfermedad' },
  { id: 2, descripcion: 'Actividad institucional' },
  { id: 3, descripcion: 'Falla en servicio público' },
  { id: 4, descripcion: 'Permiso personal' },
];

const ReposicionesTab: React.FC = () => {
  const { usuario, rol } = useAuth();
  const [tutores] = useState<Personal[]>(mockTutores);
  const [tutorSeleccionadoId, setTutorSeleccionadoId] = useState<number>(mockTutores[0]?.id || 1);

  // Auto-seleccionar tutor si el usuario logueado es TUTOR
  useEffect(() => {
    if (rol === 'TUTOR' && usuario) {
      if (typeof usuario === 'string') {
        let tutorEncontrado = tutores.find(t => t.correo === usuario);

        if (!tutorEncontrado) {
          const termino = usuario.toLowerCase();
          tutorEncontrado = tutores.find(t =>
            t.nombres.toLowerCase().includes(termino) ||
            t.apellidos.toLowerCase().includes(termino) ||
            `${t.nombres} ${t.apellidos}`.toLowerCase().includes(termino)
          );
        }

        if (tutorEncontrado) {
          setTutorSeleccionadoId(tutorEncontrado.id);
        }
      } else if ((usuario as any).id) {
        setTutorSeleccionadoId((usuario as any).id);
      }
    }
  }, [rol, usuario, tutores]);

  const [asistencias, setAsistencias] = useState<AsistenciaTutor[]>([
    {
      id: 1,
      fecha: '2025-11-25',
      id_horario: 1,
      id_tutor: 1,
      estado: 'DICTO_CLASE',
      observaciones: 'Clase normal',
      horarioInfo: 'LUNES 08:00-10:00',
      aulaInfo: '5°A - Sede Principal',
      tutorNombre: 'Laura Rodríguez'
    },
    {
      id: 2,
      fecha: '2025-11-27',
      id_horario: 2,
      id_tutor: 1,
      estado: 'NO_DICTO_CLASE',
      motivo: 'Enfermedad',
      horarioInfo: 'MIERCOLES 10:00-12:00',
      aulaInfo: '5°A - Sede Principal',
      tutorNombre: 'Laura Rodríguez'
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AsistenciaTutorFormData>({
    fecha: hoyISO(),
    id_horario: mockHorarios[0]?.id || 0,
    estado: 'DICTO_CLASE',
    motivo: '',
    observaciones: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'DICTO_CLASE' | 'NO_DICTO_CLASE'>('TODOS');

  // Horarios del tutor seleccionado
  const horariosDelTutor = useMemo(() => {
    return mockHorarios.filter(h => h.id === tutorSeleccionadoId);
  }, [tutorSeleccionadoId]);

  // Filtros
  const asistenciasFiltradas = useMemo(() => {
    return asistencias.filter(a => {
      const matchesTutor = a.id_tutor === tutorSeleccionadoId;
      const matchesSearch =
        a.fecha.includes(searchTerm) ||
        (a.horarioInfo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.aulaInfo || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstado = filterEstado === 'TODOS' || a.estado === filterEstado;

      return matchesTutor && matchesSearch && matchesEstado;
    });
  }, [asistencias, tutorSeleccionadoId, searchTerm, filterEstado]);

  // Stats
  const stats = useMemo(() => ({
    total: asistenciasFiltradas.length,
    dictoClase: asistenciasFiltradas.filter(a => a.estado === 'DICTO_CLASE').length,
    noDictoClase: asistenciasFiltradas.filter(a => a.estado === 'NO_DICTO_CLASE').length,
  }), [asistenciasFiltradas]);

  // Handlers
  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      fecha: hoyISO(),
      id_horario: horariosDelTutor[0]?.id || 0,
      estado: 'DICTO_CLASE',
      motivo: '',
      observaciones: '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (asistencia: AsistenciaTutor) => {
    setEditingId(asistencia.id);
    setFormData({
      fecha: asistencia.fecha,
      id_horario: asistencia.id_horario,
      estado: asistencia.estado,
      motivo: asistencia.motivo || '',
      observaciones: asistencia.observaciones || '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.fecha) return 'La fecha es requerida';
    if (!formData.id_horario) return 'El horario es requerido';
    if (formData.estado === 'NO_DICTO_CLASE' && !formData.motivo?.trim()) {
      return 'El motivo es requerido cuando no se dictó clase';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    const aulaHorarioRelacion = mockAulaHorario.find(ah => ah.id_horario === formData.id_horario);
    const aula = mockAulas.find(a => a.id === aulaHorarioRelacion?.id_aula);
    const horario = mockHorarios.find(h => h.id === formData.id_horario);
    const tutor = tutores.find(t => t.id === tutorSeleccionadoId);

    const nuevaAsistencia: AsistenciaTutor = {
      id: editingId || generateId(asistencias),
      fecha: formData.fecha,
      id_horario: formData.id_horario,
      id_tutor: tutorSeleccionadoId,
      estado: formData.estado,
      motivo: formData.estado === 'NO_DICTO_CLASE' ? formData.motivo : undefined,
      observaciones: formData.observaciones || undefined,
      horarioInfo: horario ? `${horario.dia_sem} ${horario.hora_ini}-${horario.hora_fin}` : '',
      aulaInfo: aula ? `${aula.grado}°${aula.grupo} - ${aula.sedeNombre}` : '',
      tutorNombre: tutor ? `${tutor.nombres} ${tutor.apellidos}` : '',
    };

    if (editingId) {
      setAsistencias(prev => prev.map(a => a.id === editingId ? nuevaAsistencia : a));
    } else {
      setAsistencias(prev => [...prev, nuevaAsistencia]);
    }

    closeForm();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar este registro de asistencia?')) {
      setAsistencias(prev => prev.filter(a => a.id !== id));
    }
  };

  const getEstadoBadge = (estado: 'DICTO_CLASE' | 'NO_DICTO_CLASE') => {
    if (estado === 'DICTO_CLASE') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3" />
          Dictó Clase
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" />
        No Dictó Clase
      </span>
    );
  };

  const tutorSeleccionado = tutores.find(t => t.id === tutorSeleccionadoId);
  const tutorHorarios = tutorSeleccionado ? mockTutorAula.filter(ta => ta.id_tutor === tutorSeleccionado.id) : [];
  const horariosConInfoDelTutor = useMemo(() => {
    if (!tutorSeleccionadoId) return [];

    // Paso 1: Obtener aulas del tutor
    const idsAulasDelTutor = mockTutorAula
      .filter(ta => ta.id_tutor === tutorSeleccionadoId && !ta.fecha_fin)
      .map(ta => ta.id_aula);

    if (idsAulasDelTutor.length === 0) return [];

    // Paso 2: Obtener relaciones aula-horario de esas aulas
    const relacionesAulaHorario = mockAulaHorario
      .filter(ah => idsAulasDelTutor.includes(ah.id_aula));

    // Paso 3: Construir array con info completa
    const horariosConInfo: Array<{
      id: number;
      id_aula: number;
      id_horario: number;
      dia_sem: string;
      hora_ini: string;
      hora_fin: string;
      grado: number;
      grupo: string;
    }> = [];

    relacionesAulaHorario.forEach(relacion => {
      const horario = mockHorarios.find(h => h.id === relacion.id_horario);
      const aula = mockAulas.find(a => a.id === relacion.id_aula);

      if (horario && aula) {
        horariosConInfo.push({
          id: relacion.id, // ID de la relación AulaHorario
          id_aula: aula.id,
          id_horario: horario.id,
          dia_sem: horario.dia_sem,
          hora_ini: horario.hora_ini,
          hora_fin: horario.hora_fin,
          grado: aula.grado,
          grupo: aula.grupo,
        });
      }
    });

    return horariosConInfo;
  }, [tutorSeleccionadoId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Asistencia del Tutor
            </CardTitle>
            <CardDescription>
              Registro de clases dictadas. Los estudiantes solo pueden tener asistencia si el tutor marcó que dictó clase.
            </CardDescription>
          </div>
          <button
            onClick={openCreateForm}
            disabled={horariosDelTutor.length === 0}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Plus className="w-5 h-5" />
            Registrar Asistencia
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Selector de Tutor */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Tutor
          </label>
          <select
            value={tutorSeleccionadoId}
            onChange={(e) => setTutorSeleccionadoId(Number(e.target.value))}
            disabled={rol === 'TUTOR'}
            className={`w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white font-medium transition-all hover:border-indigo-300 ${rol === 'TUTOR' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
          >
            {tutores.map(t => (
              <option key={t.id} value={t.id}>
                {t.nombres} {t.apellidos}
              </option>
            ))}
          </select>
          {rol === 'TUTOR' && (
            <p className="text-xs text-gray-500 mt-2">
              Como tutor, solo puedes ver y registrar tu propia asistencia.
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Registros</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
            <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">Clases Dictadas</div>
            <div className="text-3xl font-bold text-green-900 mt-2">{stats.dictoClase}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500">
            <div className="text-red-600 text-sm font-semibold uppercase tracking-wide">Clases No Dictadas</div>
            <div className="text-3xl font-bold text-red-900 mt-2">{stats.noDictoClase}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por fecha, horario o aula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="DICTO_CLASE">Dictó Clase</option>
            <option value="NO_DICTO_CLASE">No Dictó Clase</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Horario</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Aula</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">Motivo/Observaciones</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-green-900 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 italic">
                    {searchTerm || filterEstado !== 'TODOS'
                      ? 'No se encontraron registros con ese criterio de búsqueda'
                      : `No hay registros de asistencia para ${tutorSeleccionado?.nombres}. Haz clic en "Registrar Asistencia" para comenzar.`}
                  </td>
                </tr>
              ) : (
                asistenciasFiltradas.map((asistencia) => (
                  <tr key={asistencia.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{asistencia.fecha}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asistencia.horarioInfo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asistencia.aulaInfo}</td>
                    <td className="px-4 py-3 text-center">{getEstadoBadge(asistencia.estado)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {asistencia.estado === 'NO_DICTO_CLASE' && asistencia.motivo && (
                        <div className="flex items-start gap-1">
                          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-orange-700">{asistencia.motivo}</span>
                        </div>
                      )}
                      {asistencia.observaciones && (
                        <div className="text-xs text-gray-500 mt-1">{asistencia.observaciones}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openEditForm(asistencia)}
                          className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asistencia.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">
              {editingId ? 'Editar Asistencia' : `Registrar Asistencia - ${tutorSeleccionado?.nombres} ${tutorSeleccionado?.apellidos}`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    required
                    value={formData.fecha}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_horario"
                    required
                    value={formData.id_horario}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona un horario</option>
                    {horariosConInfoDelTutor.length === 0 ? (
                      <option value="" disabled>No hay horarios asignados</option>
                    ) : (
                      horariosConInfoDelTutor.map(h => (
                        <option key={h.id} value={h.id_horario}>
                          {h.dia_sem} {h.hora_ini}-{h.hora_fin} ({h.grado}°{h.grupo})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estado"
                      value="DICTO_CLASE"
                      checked={formData.estado === 'DICTO_CLASE'}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Dictó Clase</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estado"
                      value="NO_DICTO_CLASE"
                      checked={formData.estado === 'NO_DICTO_CLASE'}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">No Dictó Clase</span>
                  </label>
                </div>
              </div>

              {formData.estado === 'NO_DICTO_CLASE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="motivo"
                    required={formData.estado === 'NO_DICTO_CLASE'}
                    value={formData.motivo}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Seleccionar motivo --</option>
                    {mockMotivos.map(m => (
                      <option key={m.id} value={m.descripcion}>{m.descripcion}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Comentarios adicionales..."
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReposicionesTab;
