<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';
import type { Estudiante, NotaPorComponente } from '../../../types/estudiantes.types';

export function NotasTab() {
  const { usuario, rol } = useAuth();
  const [selectedPeriodo, setSelectedPeriodo] = useState('1');
  const [selectedAula, setSelectedAula] = useState('1');
=======
=======
>>>>>>> Stashed changes
import React, { useMemo, useState, useEffect } from 'react';
import type { Personal } from '../../../types/personal';
import type { Aula } from '../../../types/aula';
import type { Estudiante } from '../../../types/estudiante';
import type { TutorAula } from '../../../types/asignaciones';
import type { Componente, Nota } from '../../../types/nota';
import { useAuth } from '../../../context/AuthContext';
import NotasForm from './NotasForm';
>>>>>>> Stashed changes

  if (!usuario || !rol) return null;

  const esTutor = rol === 'TUTOR';

  const periodos = [
    { id: 1, nombre: 'Periodo 1' },
    { id: 2, nombre: 'Periodo 2' },
    { id: 3, nombre: 'Periodo 3' },
  ];

<<<<<<< Updated upstream
  const misAulas = [{ id: 1, nombre: 'INSIDECLASSROOM - Aula 101' }];
=======
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
>>>>>>> Stashed changes

  const componentesNota = [
    { id: 1, nombre: 'Listening', porcentaje: 25 },
    { id: 2, nombre: 'Speaking', porcentaje: 25 },
    { id: 3, nombre: 'Reading', porcentaje: 25 },
    { id: 4, nombre: 'Writing', porcentaje: 25 },
  ];

<<<<<<< Updated upstream
  const estudiantes: Estudiante[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      notas: { 1: 4.5, 2: 4.0, 3: 4.8, 4: 4.2 },
    },
    {
      id: 2,
      nombre: 'María González',
      notas: { 1: 3.5, 2: 4.5, 3: 4.0, 4: 3.8 },
    },
  ];

  // ✅ Usar el type NotaPorComponente
  const [notas, setNotas] = useState<Record<number, NotaPorComponente>>(
    estudiantes.reduce((acc, est) => {
      acc[est.id] = est.notas;
      return acc;
    }, {} as Record<number, NotaPorComponente>)
=======
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
  const { usuario, rol } = useAuth();
  const [tutores] = useState<Personal[]>(mockTutores);
  const [aulas] = useState<Aula[]>(mockAulas);
  const [tutorAula] = useState<TutorAula[]>(mockTutorAula);
  const [estudiantes] = useState<Estudiante[]>(mockEstudiantes);
  const [componentes] = useState<Componente[]>(mockComponentes);
  const [tutorActivoId, setTutorActivoId] = useState<TutorFilter>('none');
  const [aulaIdSeleccionada, setAulaIdSeleccionada] = useState<number | 0>(0);
  const [programaFilter, setProgramaFilter] = useState<ProgramaFilter>('all');
  const [componenteIdSeleccionado, setComponenteIdSeleccionado] = useState<number | 0>(0);
  const [searchEst, setSearchEst] = useState('');

  useEffect(() => {
    if (rol === 'TUTOR' && usuario) {
      setTutorActivoId(usuario.id);   // AHORA SÍ EXISTE usuario.id
    }
  }, [rol, usuario]);


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
>>>>>>> Stashed changes
  );

  // ✅ Handler actualizado para permitir campos vacíos
  const handleNotaChange = (estudianteId: number, componenteId: number, valor: string) => {
    if (valor === '') {
      setNotas(prev => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [componenteId]: undefined,
        },
      }));
      return;
    }

    const nota = parseFloat(valor);
    if (!isNaN(nota) && nota >= 0 && nota <= 5) {
      setNotas(prev => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [componenteId]: nota,
        },
      }));
    }
  };

  // ✅ calcularPromedio actualizado para manejar undefined
  const calcularPromedio = (estudianteId: number) => {
    const notasEstudiante = notas[estudianteId];
    if (!notasEstudiante) return '0.00';

    let total = 0;
    componentesNota.forEach(comp => {
      const nota = notasEstudiante[comp.id];
      if (nota !== undefined && nota !== null) {
        total += (nota * comp.porcentaje) / 100;
      }
    });

    return total.toFixed(2);
  };

  const handleGuardarNotas = () => {
    console.log('Guardando notas:', {
      periodo: selectedPeriodo,
      aula: selectedAula,
      notas,
    });
    alert('Notas guardadas correctamente');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{esTutor ? 'Registro de Notas' : 'Notas de Estudiantes'}</CardTitle>
        <CardDescription>
          {esTutor
            ? 'Ingresa las calificaciones de tus estudiantes'
            : 'Registro de calificaciones por periodo y componente'}
        </CardDescription>
      </CardHeader>

      <CardContent>
<<<<<<< Updated upstream
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Periodo</label>
            <select
              value={selectedPeriodo}
              onChange={e => setSelectedPeriodo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {periodos.map(periodo => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
=======
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {rol !== 'TUTOR' &&
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
            }

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
>>>>>>> Stashed changes
          </div>

          {esTutor && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Aula</label>
              <select
                value={selectedAula}
                onChange={e => setSelectedAula(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {misAulas.map(aula => (
                  <option key={aula.id} value={aula.id}>
                    {aula.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Estudiante</th>
                {componentesNota.map(comp => (
                  <th key={comp.id} className="border px-4 py-2 text-center">
                    {comp.nombre}
                    <br />
                    <span className="text-xs text-gray-600">({comp.porcentaje}%)</span>
                  </th>
                ))}
                <th className="border px-4 py-2 text-center bg-primary-50">Promedio</th>
              </tr>
            </thead>

            <tbody>
              {estudiantes.map(est => (
                <tr key={est.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{est.nombre}</td>

                  {componentesNota.map(comp => (
                    <td key={comp.id} className="border px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={notas[est.id]?.[comp.id] ?? ''}
                        onChange={e => handleNotaChange(est.id, comp.id, e.target.value)}
                        className="w-full px-2 py-1 text-center border rounded"
                      />
                    </td>
                  ))}

                  <td className="border px-4 py-2 font-bold text-center bg-primary-50">
                    {calcularPromedio(est.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleGuardarNotas}
          className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-primary-700"
        >
          Guardar Notas
        </button>
      </CardContent>
    </Card>
  );
}