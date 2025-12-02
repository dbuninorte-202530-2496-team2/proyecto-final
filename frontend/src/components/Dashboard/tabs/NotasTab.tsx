import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { Personal } from '../../../types/personal';
import type { Aula } from '../../../types/aula';
import type { Estudiante } from '../../../types/estudiante';
import type { Componente, Nota } from '../../../types/nota';
import type { Periodo } from '../../../types/periodo';

// Import services
import { personalService } from '../../../services/api/personal.service';
import { aulasService } from '../../../services/api/aulas.service';
import { estudiantesService } from '../../../services/api/estudiantes.service';
import { componentesService } from '../../../services/api/componentes.service';
import { tutorAulaService } from '../../../services/api/tutor-aula.service';
import { notasService } from '../../../services/api/notas.service';
import { periodosService } from '../../../services/api/periodos.service';

import NotasForm from './NotasForm';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';

import {
  Search,
  Users,
  FileText,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

type TutorFilter = number | 'none';

const NotasTab: React.FC = () => {
  // Data states
  const [tutores, setTutores] = useState<Personal[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [componentes, setComponentes] = useState<Componente[]>([]);

  const { usuario, rol } = useAuth();

  const [tutorActivoId, setTutorActivoId] = useState<TutorFilter>('none');
  const [aulaIdSeleccionada, setAulaIdSeleccionada] = useState<number | 0>(0);
  const [periodoIdSeleccionado, setPeriodoIdSeleccionado] = useState<number | 0>(0);
  const [componenteIdSeleccionado, setComponenteIdSeleccionado] = useState<number | 0>(0);
  const [searchEst, setSearchEst] = useState('');

  const [notasState, setNotasState] = useState<{
    [idEstudiante: number]: { valor: number | ''; comentario: string };
  }>({});

  const [notasGuardadas, setNotasGuardadas] = useState<Nota[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load tutores and periodos on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [tutoresData, periodosData] = await Promise.all([
          personalService.getTutores(),
          periodosService.getAll(),
        ]);
        setTutores(tutoresData);
        setPeriodos(periodosData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  // Auto-select tutor
  useEffect(() => {
    if (tutores.length > 0) {
      // Auto-seleccionar tutor si es TUTOR logueado
      if (rol === 'TUTOR' && usuario) {
        const correo = typeof usuario === 'string' ? usuario : (usuario as any).correo;
        const tutorEncontrado = tutores.find(t => t.correo === correo);
        if (tutorEncontrado) {
          setTutorActivoId(tutorEncontrado.id);
        } else {
          setTutorActivoId(tutores[0].id);
        }
      } else {
        // Para ADMIN/ADMINISTRATIVO, seleccionar el primer tutor
        setTutorActivoId(tutores[0].id);
      }
    }
  }, [rol, usuario, tutores]);

  // Load aulas when tutor is selected
  useEffect(() => {
    if (tutorActivoId === 'none') {
      setAulas([]);
      return;
    }

    const loadAulasYRelaciones = async () => {
      try {
        // Get tutor-aula relations
        const relaciones = await tutorAulaService.getHistoricoPorTutor(tutorActivoId as number);

        // Filter active relations
        const relacionesActivas = relaciones.filter(r => !r.fecha_desasignado);

        // Get aulas details
        const allAulas = await aulasService.getAll();
        const aulasDelTutor = allAulas.filter(a =>
          relacionesActivas.some(r => r.id_aula === a.id)
        );
        setAulas(aulasDelTutor);
      } catch (error) {
        console.error('Error loading aulas:', error);
      }
    };

    loadAulasYRelaciones();
  }, [tutorActivoId]);

  // Load estudiantes when aula is selected
  useEffect(() => {
    if (!aulaIdSeleccionada) {
      setEstudiantes([]);
      return;
    }

    const loadEstudiantes = async () => {
      try {
        const allEstudiantes = await estudiantesService.getAll();
        // Filter students in this aula
        const estudiantesDelAula = allEstudiantes.filter(e => e.aula_actual_id === aulaIdSeleccionada);
        setEstudiantes(estudiantesDelAula);
      } catch (error) {
        console.error('Error loading estudiantes:', error);
      }
    };

    loadEstudiantes();
  }, [aulaIdSeleccionada]);

  // Load componentes when aula and periodo are selected
  useEffect(() => {
    if (!aulaIdSeleccionada || !periodoIdSeleccionado) {
      setComponentes([]);
      return;
    }

    const loadComponentes = async () => {
      try {
        const aula = aulas.find(a => a.id === aulaIdSeleccionada);
        if (!aula) return;

        // Determine tipo_programa from grade
        const tipoPrograma = (aula.grado === 4 || aula.grado === 5) ? 1 : 2;

        const componentes = await componentesService.getByPeriodo(periodoIdSeleccionado, tipoPrograma);
        setComponentes(componentes);
      } catch (error) {
        console.error('Error loading componentes:', error);
      }
    };

    loadComponentes();
  }, [aulaIdSeleccionada, periodoIdSeleccionado, aulas]);

  // Load existing notas when aula and componente are selected
  useEffect(() => {
    if (!aulaIdSeleccionada || !componenteIdSeleccionado) {
      setNotasGuardadas([]);
      return;
    }

    const loadNotas = async () => {
      try {
        const notas = await notasService.getAll({
          id_aula: aulaIdSeleccionada,
          id_componente: componenteIdSeleccionado,
        });
        setNotasGuardadas(notas);
      } catch (error) {
        console.error('Error loading notas:', error);
      }
    };

    loadNotas();
  }, [aulaIdSeleccionada, componenteIdSeleccionado]);

  const tutorActivo = useMemo(
    () =>
      tutorActivoId === 'none'
        ? null
        : tutores.find((t) => t.id === tutorActivoId) ?? null,
    [tutores, tutorActivoId],
  );

  const aulaSeleccionada = useMemo(
    () =>
      aulaIdSeleccionada === 0
        ? null
        : aulas.find((a) => a.id === aulaIdSeleccionada) ?? null,
    [aulas, aulaIdSeleccionada],
  );

  const componenteSeleccionado = useMemo(
    () =>
      componenteIdSeleccionado === 0
        ? null
        : componentes.find((c) => c.id === componenteIdSeleccionado) ?? null,
    [componentes, componenteIdSeleccionado],
  );

  const estudiantesDelAula = useMemo(() => {
    const base = aulaSeleccionada
      ? estudiantes.filter((e) => e.aula_actual_id === aulaSeleccionada.id)
      : [];

    const termino = searchEst.toLowerCase().trim();
    if (!termino) return base;

    return base.filter(
      (e) =>
        `${e.nombre} ${e.apellidos}`.toLowerCase().includes(termino) ||
        e.codigo.toLowerCase().includes(termino),
    );
  }, [estudiantes, aulaSeleccionada, searchEst]);

  const promedioComponente = useMemo(() => {
    if (!componenteSeleccionado || estudiantesDelAula.length === 0) {
      return 0;
    }
    const notasDelComp = notasGuardadas.filter((n) =>
      n.id_comp === componenteSeleccionado.id &&
      estudiantesDelAula.some((e) => e.id === n.id_estudiante),
    );
    if (notasDelComp.length === 0) return 0;
    const suma = notasDelComp.reduce((acc, n) => acc + Number(n.valor), 0);
    return Math.round((suma / notasDelComp.length) * 10) / 10;
  }, [componenteSeleccionado, estudiantesDelAula, notasGuardadas]);

  const totalNotasRegistradas = useMemo(() => {
    if (!componenteSeleccionado) return 0;
    return notasGuardadas.filter((n) => n.id_comp === componenteSeleccionado.id).length;
  }, [componenteSeleccionado, notasGuardadas]);

  const totalEstudiantes = estudiantesDelAula.length;

  // Handlers
  const resetForm = () => {
    setNotasState({});
    setSaveError(null);
  };

  const handleChangeTutor = (value: string) => {
    const newId = value === 'none' ? 'none' : Number(value);
    setTutorActivoId(newId as TutorFilter);
    setAulaIdSeleccionada(0);
    setComponenteIdSeleccionado(0);
    resetForm();
  };

  const handleChangeAula = (value: string) => {
    setAulaIdSeleccionada(value === '0' ? 0 : Number(value));
    setPeriodoIdSeleccionado(0); // Reset periodo al cambiar aula
    setComponenteIdSeleccionado(0); // Reset componente al cambiar aula
    resetForm();
  };

  const handleChangePeriodo = (value: string) => {
    setPeriodoIdSeleccionado(value === '0' ? 0 : Number(value));
    setComponenteIdSeleccionado(0); // Reset componente al cambiar periodo
    resetForm();
  };

  // const handleChangePrograma = ... // Removed

  const handleChangeComponente = (value: string) => {
    setComponenteIdSeleccionado(value === '0' ? 0 : Number(value));
    resetForm();
  };

  const handleChangeValor = (idEst: number, valor: number | '') => {
    setNotasState((prev) => {
      const current = prev[idEst] ?? { valor: '', comentario: '' };
      return { ...prev, [idEst]: { ...current, valor } };
    });
  };

  const handleChangeComentario = (idEst: number, comentario: string) => {
    setNotasState((prev) => {
      const current = prev[idEst] ?? { valor: '', comentario: '' };
      return { ...prev, [idEst]: { ...current, comentario } };
    });
  };

  const validarNotas = (): string | null => {
    if (!tutorActivo || !aulaSeleccionada || !periodoIdSeleccionado || !componenteSeleccionado) {
      return 'Debes seleccionar tutor, aula, periodo y componente antes de guardar.';
    }
    if (estudiantesDelAula.length === 0) {
      return 'No hay estudiantes en el aula seleccionada.';
    }

    let tieneAlMenosUnaNota = false;

    for (const est of estudiantesDelAula) {
      const n = notasState[est.id];
      if (n && n.valor !== '') {
        tieneAlMenosUnaNota = true;
        if (typeof n.valor === 'number') {
          if (n.valor < 0 || n.valor > 100) {
            return `La nota de ${est.nombre} ${est.apellidos} debe estar entre 0 y 100.`;
          }
        }
      }
    }

    if (!tieneAlMenosUnaNota) {
      return 'Debes diligenciar al menos una nota para guardar.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validarNotas();
    if (error) {
      setSaveError(error);
      return;
    }

    if (!tutorActivo || !aulaSeleccionada || !componenteSeleccionado) return;

    setSaveError(null);
    setIsSaving(true);

    try {
      // Create array of promises to save all notas
      const savePromises: Promise<any>[] = [];

      for (const est of estudiantesDelAula) {
        const n = notasState[est.id];
        if (!n || n.valor === '') continue;

        const payload = {
          id_estudiante: est.id,
          id_componente: componenteSeleccionado.id,
          id_tutor: tutorActivo.id,
          valor: Number(n.valor),
          comentario: n.comentario && n.comentario.trim() !== '' ? n.comentario.trim() : undefined,
        };

        savePromises.push(notasService.create(payload));
      }

      // Save all in parallel
      await Promise.all(savePromises);

      // Reload notas from server to display saved data
      const updatedNotas = await notasService.getAll({
        id_aula: aulaIdSeleccionada,
        id_componente: componenteIdSeleccionado,
      });
      setNotasGuardadas(updatedNotas);

      // Clear form
      resetForm();
    } catch (error) {
      console.error('Error saving notas:', error);
      setSaveError('Error al guardar las notas. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Renders
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              Gestión de Notas
            </CardTitle>
            <CardDescription>
              Registra las notas de los estudiantes por componente del período académico
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tutor
              </label>
              <select
                value={tutorActivoId === 'none' ? 'none' : tutorActivoId}
                onChange={(e) => handleChangeTutor(e.target.value)}
                disabled={rol === 'TUTOR' || tutores.length === 0}
                className={`w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-medium transition-all hover:border-green-300 ${rol === 'TUTOR' || tutores.length === 0 ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value="none">Selecciona un tutor</option>
                {tutores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} {t.apellido}
                  </option>
                ))}
              </select>
              {rol === 'TUTOR' && (
                <p className="text-xs text-gray-500 mt-2">
                  Como tutor, solo puedes gestionar las notas de tus propias aulas.
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Aula del tutor
                </label>
                {aulaSeleccionada && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${aulaSeleccionada.grado === 4 || aulaSeleccionada.grado === 5
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                  >
                    {aulaSeleccionada.grado === 4 || aulaSeleccionada.grado === 5
                      ? 'INSIDECLASSROOM'
                      : 'OUTSIDECLASSROOM'}
                  </span>
                )}
              </div>
              <select
                value={aulaIdSeleccionada || 0}
                onChange={(e) => handleChangeAula(e.target.value)}
                disabled={!tutorActivo}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={0}>Selecciona un aula</option>
                {aulas.map((a) => (
                  <option key={a.id} value={a.id}>
                    Grado {a.grado}°{a.grupo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Periodo académico
              </label>
              <select
                value={periodoIdSeleccionado || 0}
                onChange={(e) => handleChangePeriodo(e.target.value)}
                disabled={!aulaSeleccionada}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={0}>Selecciona un periodo</option>
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.anho}-{p.numero}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Componente del período
              </label>
              <select
                value={componenteIdSeleccionado || 0}
                onChange={(e) => handleChangeComponente(e.target.value)}
                disabled={!aulaSeleccionada || !periodoIdSeleccionado}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={0}>Selecciona un componente</option>
                {componentes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.porcentaje}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar estudiante
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchEst}
                  onChange={(e) => setSearchEst(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-300 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de notas */}
        <NotasForm
          tutor={tutorActivo}
          aula={aulaSeleccionada}
          componente={componenteSeleccionado}
          estudiantes={estudiantesDelAula}
          notas={notasState}
          notasGuardadas={notasGuardadas} // Pass existing notes
          isSaving={isSaving}
          error={saveError}
          onChangeValor={handleChangeValor}
          onChangeComentario={handleChangeComentario}
          onSubmit={handleSubmit}
        />

        {/* Estadísticas */}
        {aulaSeleccionada && componenteSeleccionado && estudiantesDelAula.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* Total de estudiantes */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-semibold">Estudiantes en el aula</p>
                  <p className="text-3xl font-bold text-emerald-900">{totalEstudiantes}</p>
                </div>
              </div>
            </div>

            {/* Notas registradas */}
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-sky-800" />
                </div>
                <div>
                  <p className="text-sm text-sky-700 font-semibold">Notas registradas</p>
                  <p className="text-3xl font-bold text-sky-900">{totalNotasRegistradas}</p>
                </div>
              </div>
            </div>

            {/* Promedio */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-800" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-semibold">Promedio en este componente</p>
                  <p className="text-3xl font-bold text-purple-900">{promedioComponente.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotasTab;
