import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { Personal } from '../../../types/personal';
import type { Aula } from '../../../types/aula';
import type { Estudiante } from '../../../types/estudiante';
import type { TutorAula } from '../../../types/asignaciones';
import type { Componente, Nota } from '../../../types/nota';

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
type ProgramaFilter = 'all' | 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM';

// Datos de prueba
const mockTutores: Personal[] = [
  {
    id: 1,
    nombres: 'Laura',
    apellidos: 'Rodríguez',
    correo: 'laura.rod@globalenglish.edu.co',
    telefono: '3002223344',
    tipo_doc: 1,
    num_doc: '1012345678',
    id_rol: 2,
  },
  {
    id: 3,
    nombres: 'Carlos',
    apellidos: 'Martínez',
    correo: 'carlos.mtz@globalenglish.edu.co',
    telefono: '3003334455',
    tipo_doc: 1,
    num_doc: '1009876543',
    id_rol: 2,
  },
];

const mockAulas: Aula[] = [
  { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
  { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
  { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
];

const mockTutorAula: TutorAula[] = [
  { id: 1, id_aula: 1, id_tutor: 1, fecha_asignado: '2025-02-01', fecha_desasignado: null },
  { id: 2, id_aula: 3, id_tutor: 3, fecha_asignado: '2025-02-10', fecha_desasignado: null },
];

const mockEstudiantes: Estudiante[] = [
  {
    id: 1,
    nombres: 'Maria José',
    apellidos: 'Aroca Franco',
    tipo_doc: 2,
    num_doc: '200194043',
    id_aula: 1,
    score_in: 78,
    score_out: 85,
  },
  {
    id: 2,
    nombres: 'Ana',
    apellidos: 'García López',
    tipo_doc: 3,
    num_doc: '202000111',
    id_aula: 1,
    score_in: 82,
    score_out: 90,
  },
  {
    id: 3,
    nombres: 'Pepito',
    apellidos: 'Pérez Díaz',
    tipo_doc: 3,
    num_doc: '202000222',
    id_aula: 3,
    score_in: 70,
    score_out: 79,
  },
];

const mockComponentes: Componente[] = [
  {
    id: 1,
    nombre: 'Inside – Participación',
    tipo_programa: 'INSIDECLASSROOM',
    porcentaje: 30,
    id_periodo: 1,
  },
  {
    id: 2,
    nombre: 'Inside – Evaluación final',
    tipo_programa: 'INSIDECLASSROOM',
    porcentaje: 70,
    id_periodo: 1,
  },
  {
    id: 3,
    nombre: 'Outside – Proyecto',
    tipo_programa: 'OUTSIDECLASSROOM',
    porcentaje: 40,
    id_periodo: 1,
  },
  {
    id: 4,
    nombre: 'Outside – Presentación oral',
    tipo_programa: 'OUTSIDECLASSROOM',
    porcentaje: 60,
    id_periodo: 1,
  },
];

const NotasTab: React.FC = () => {
  const [tutores] = useState<Personal[]>(mockTutores);
  const [aulas] = useState<Aula[]>(mockAulas);
  const [tutorAula] = useState<TutorAula[]>(mockTutorAula);
  const [estudiantes] = useState<Estudiante[]>(mockEstudiantes);
  const [componentes] = useState<Componente[]>(mockComponentes);

  const { usuario, rol } = useAuth();

  const [tutorActivoId, setTutorActivoId] = useState<TutorFilter>('none');

  // Efecto para inicializar el tutor activo
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
          setTutorActivoId(tutorEncontrado.id);
        } else {
          console.warn('No se encontró coincidencia exacta para el usuario en NotasTab, usando fallback ID 1');
          setTutorActivoId(1);
        }
      }
      else if ((usuario as any).id) {
        setTutorActivoId((usuario as any).id);
      }
    }
  }, [rol, usuario, tutores]);
  const [aulaIdSeleccionada, setAulaIdSeleccionada] = useState<number | 0>(0);
  const [programaFilter, setProgramaFilter] = useState<ProgramaFilter>('all');
  const [componenteIdSeleccionado, setComponenteIdSeleccionado] = useState<number | 0>(0);
  const [searchEst, setSearchEst] = useState('');

  const [notasState, setNotasState] = useState<{
    [idEstudiante: number]: { valor: number | ''; comentario: string };
  }>({});

  const [notasGuardadas, setNotasGuardadas] = useState<Nota[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tutorActivo = useMemo(
    () =>
      tutorActivoId === 'none'
        ? null
        : tutores.find((t) => t.id === tutorActivoId) ?? null,
    [tutores, tutorActivoId],
  );

  const aulasDelTutor = useMemo(() => {
    if (!tutorActivo) return [];
    const idsAulas = tutorAula
      .filter((ta) => ta.id_tutor === tutorActivo.id && !ta.fecha_desasignado)
      .map((ta) => ta.id_aula);
    return aulas.filter((a) => idsAulas.includes(a.id));
  }, [tutorActivo, tutorAula, aulas]);

  const aulaSeleccionada = useMemo(
    () =>
      aulaIdSeleccionada === 0
        ? null
        : aulas.find((a) => a.id === aulaIdSeleccionada) ?? null,
    [aulas, aulaIdSeleccionada],
  );

  const componentesFiltrados = useMemo(() => {
    if (programaFilter === 'all') return componentes;
    return componentes.filter((c) => c.tipo_programa === programaFilter);
  }, [componentes, programaFilter]);

  const componenteSeleccionado = useMemo(
    () =>
      componenteIdSeleccionado === 0
        ? null
        : componentes.find((c) => c.id === componenteIdSeleccionado) ?? null,
    [componentes, componenteIdSeleccionado],
  );

  const estudiantesDelAula = useMemo(() => {
    const base = aulaSeleccionada
      ? estudiantes.filter((e) => e.id_aula === aulaSeleccionada.id)
      : [];

    const termino = searchEst.toLowerCase().trim();
    if (!termino) return base;

    return base.filter(
      (e) =>
        `${e.nombres} ${e.apellidos}`.toLowerCase().includes(termino) ||
        e.num_doc.toLowerCase().includes(termino),
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
    const suma = notasDelComp.reduce((acc, n) => acc + n.valor, 0);
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
    resetForm();
  };

  const handleChangePrograma = (value: string) => {
    setProgramaFilter(value as ProgramaFilter);
    setComponenteIdSeleccionado(0);
    resetForm();
  };

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
    if (!tutorActivo || !aulaSeleccionada || !componenteSeleccionado) {
      return 'Debes seleccionar tutor, aula y componente antes de guardar.';
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
            return `La nota de ${est.nombres} ${est.apellidos} debe estar entre 0 y 100.`;
          }
        }
      }
    }

    if (!tieneAlMenosUnaNota) {
      return 'Debes diligenciar al menos una nota para guardar.';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validarNotas();
    if (error) {
      setSaveError(error);
      return;
    }

    if (!tutorActivo || !aulaSeleccionada || !componenteSeleccionado) return;

    setSaveError(null);
    setIsSaving(true);

    const nuevosRegistros: Nota[] = [];

    estudiantesDelAula.forEach((est) => {
      const n = notasState[est.id];
      if (!n || n.valor === '') return;

      const notaFinal: Nota = {
        id: notasGuardadas.length + nuevosRegistros.length + Math.floor(Math.random() * 10000),
        valor: Number(n.valor),
        comentario: n.comentario && n.comentario.trim() !== '' ? n.comentario.trim() : null,
        id_tutor: tutorActivo.id,
        id_comp: componenteSeleccionado.id,
        id_estudiante: est.id,
      };

      nuevosRegistros.push(notaFinal);
    });

    setTimeout(() => {
      setNotasGuardadas((prev) => [...prev, ...nuevosRegistros]);
      setIsSaving(false);
      resetForm();
    }, 500);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tutor
              </label>
              <select
                value={tutorActivoId === 'none' ? 'none' : tutorActivoId}
                onChange={(e) => handleChangeTutor(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all"
              >
                <option value="none">Selecciona un tutor</option>
                {tutores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombres} {t.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aula del tutor
              </label>
              <select
                value={aulaIdSeleccionada || 0}
                onChange={(e) => handleChangeAula(e.target.value)}
                disabled={!tutorActivo}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={0}>Selecciona un aula</option>
                {aulasDelTutor.map((a) => (
                  <option key={a.id} value={a.id}>
                    Grado {a.grado}°{a.grupo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Programa
              </label>
              <select
                value={programaFilter}
                onChange={(e) => handleChangePrograma(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all"
              >
                <option value="all">Todos los programas</option>
                <option value="INSIDECLASSROOM">Inside Classroom</option>
                <option value="OUTSIDECLASSROOM">Outside Classroom</option>
              </select>
            </div>
          </div>

          {/* Componente y búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Componente del período
              </label>
              <select
                value={componenteIdSeleccionado || 0}
                onChange={(e) => handleChangeComponente(e.target.value)}
                disabled={!aulaSeleccionada}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium hover:border-green-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={0}>Selecciona un componente</option>
                {componentesFiltrados.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.porcentaje}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar estudiante
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchEst}
                  onChange={(e) => setSearchEst(e.target.value)}
                  placeholder="Por nombre, apellido o documento..."
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
