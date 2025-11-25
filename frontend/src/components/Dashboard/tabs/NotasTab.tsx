import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';
import type { Estudiante, NotaPorComponente } from '../../../types/estudiantes.types';

export function NotasTab() {
  const { usuario, rol } = useAuth();
  const [selectedPeriodo, setSelectedPeriodo] = useState('1');
  const [selectedAula, setSelectedAula] = useState('1');

  if (!usuario || !rol) return null;

  const esTutor = rol === 'TUTOR';

  const periodos = [
    { id: 1, nombre: 'Periodo 1' },
    { id: 2, nombre: 'Periodo 2' },
    { id: 3, nombre: 'Periodo 3' },
  ];

  const misAulas = [{ id: 1, nombre: 'INSIDECLASSROOM - Aula 101' }];

  const componentesNota = [
    { id: 1, nombre: 'Listening', porcentaje: 25 },
    { id: 2, nombre: 'Speaking', porcentaje: 25 },
    { id: 3, nombre: 'Reading', porcentaje: 25 },
    { id: 4, nombre: 'Writing', porcentaje: 25 },
  ];

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