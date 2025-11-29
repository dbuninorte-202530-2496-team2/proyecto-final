import React, { useMemo, useState } from 'react';
import type { Estudiante } from '../../../types/estudiante';
import type { TipoDocumento } from '../../../types/tipoDocumento';
import type { Aula } from '../../../types/aula';

import EstudiantesForm from './EstudiantesForm';
import MoverEstudianteForm from './MoverEstudianteForm';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';

import {
  Search,
  Plus,
  Users,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  MoveRight,
} from 'lucide-react';

type AulaFilter = number | 'all';

// Datos de prueba
const mockAulas: Aula[] = [
  { id: 1, grado: 4, grupo: 'A', id_sede: 1 },
  { id: 2, grado: 5, grupo: 'B', id_sede: 1 },
  { id: 3, grado: 9, grupo: 'A', id_sede: 2 },
  { id: 4, grado: 10, grupo: 'A', id_sede: 3 },
];

const mockTipoDoc: TipoDocumento[] = [
  { id: 1, nombre: 'Cédula de ciudadanía', sigla: 'CC' },
  { id: 2, nombre: 'Tarjeta de identidad', sigla: 'TI' },
  { id: 3, nombre: 'Registro civil', sigla: 'RC' },
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

// Helpers para programa y aulas
const getProgramaFromGrado = (grado: number): 'INSIDE' | 'OUTSIDE' => {
  return grado === 4 || grado === 5 ? 'INSIDE' : 'OUTSIDE';
};

const getAulaById = (aulas: Aula[], id: number | null | undefined) =>
  aulas.find((a) => a.id === id) ?? null;

const EstudiantesTab: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(mockEstudiantes);
  const [tiposDoc] = useState<TipoDocumento[]>(mockTipoDoc);
  const [aulas] = useState<Aula[]>(mockAulas);

  const [selectedAulaId, setSelectedAulaId] = useState<AulaFilter>('all');
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Estudiante>>({
    nombres: '',
    apellidos: '',
    tipo_doc: 0,
    num_doc: '',
    id_aula: 0,
    score_in: undefined,
    score_out: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para mover estudiante
  const [estudianteMover, setEstudianteMover] = useState<Estudiante | null>(null);
  const [isMoverOpen, setIsMoverOpen] = useState(false);

  // Filtros y búsqueda
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter((e) => {
      const coincideAula =
        selectedAulaId === 'all' || e.id_aula === selectedAulaId;

      const termino = search.toLowerCase().trim();
      const coincideBusqueda =
        !termino ||
        e.nombres.toLowerCase().includes(termino) ||
        e.apellidos.toLowerCase().includes(termino) ||
        e.num_doc.includes(termino);

      return coincideAula && coincideBusqueda;
    });
  }, [estudiantes, selectedAulaId, search]);

  const openCreateForm = () => {
    setIsEditing(false);
    setFormError(null);
    setFormData({
      nombres: '',
      apellidos: '',
      tipo_doc: 0,
      num_doc: '',
      id_aula: 0,
      score_in: undefined,
      score_out: undefined,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (e: Estudiante) => {
    setIsEditing(true);
    setFormError(null);
    setFormData(e);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'tipo_doc' || name === 'id_aula'
          ? Number(value)
          : name === 'score_in' || name === 'score_out'
          ? value === ''
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const validateForm = () => {
    if (!formData.nombres || formData.nombres.trim() === '')
      return 'Los nombres son obligatorios';
    if (!formData.apellidos || formData.apellidos.trim() === '')
      return 'Los apellidos son obligatorios';
    if (!formData.tipo_doc || formData.tipo_doc === 0)
      return 'Debes seleccionar un tipo de documento';
    if (!formData.num_doc || formData.num_doc.trim() === '')
      return 'El número de documento es obligatorio';
    if (!formData.id_aula || formData.id_aula === 0)
      return 'Debes seleccionar un aula';
    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);

    const payload: Estudiante = {
      id: formData.id ?? -1,
      nombres: formData.nombres!.trim(),
      apellidos: formData.apellidos!.trim(),
      tipo_doc: formData.tipo_doc as number,
      num_doc: formData.num_doc!.trim(),
      id_aula: formData.id_aula as number,
      score_in: formData.score_in ?? null,
      score_out: formData.score_out ?? null,
    };

    if (isEditing && formData.id != null) {
      setEstudiantes((prev) =>
        prev.map((e) => (e.id === formData.id ? payload : e)),
      );
    } else {
      setEstudiantes((prev) => [
        ...prev,
        { ...payload, id: Math.max(...prev.map((e) => e.id), 0) + 1 },
      ]);
    }

    setIsSubmitting(false);
    closeForm();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('¿Eliminar este estudiante?')) return;
    setEstudiantes((prev) => prev.filter((e) => e.id !== id));
  };

  // Lógica para mover estudiante de aula

  const abrirMover = (estudiante: Estudiante) => {
    setEstudianteMover(estudiante);
    setIsMoverOpen(true);
  };

  const cerrarMover = () => {
    setIsMoverOpen(false);
    setEstudianteMover(null);
  };

  const aulaActual = getAulaById(
    aulas,
    estudianteMover ? estudianteMover.id_aula : null,
  );

  // Aulas destino compatibles (mismo tipo de programa)
  const aulasDestino = useMemo(() => {
    if (!estudianteMover || !aulaActual) return [];

    const programaActual = getProgramaFromGrado(aulaActual.grado);
    return aulas.filter(
      (a) =>
        a.id !== aulaActual.id &&
        getProgramaFromGrado(a.grado) === programaActual,
    );
  }, [estudianteMover, aulaActual, aulas]);

  const handleConfirmMover = (idAulaDestino: number) => {
    if (!estudianteMover || !aulaActual) return;

    const aulaDestino = getAulaById(aulas, idAulaDestino);
    if (!aulaDestino) return;

    const programaActual = getProgramaFromGrado(aulaActual.grado);
    const programaDestino = getProgramaFromGrado(aulaDestino.grado);

    if (programaActual !== programaDestino) {
      alert(
        'No puedes mezclar 4º–5º con 9º–10º. El aula destino debe ser del mismo tipo de programa.',
      );
      return;
    }

    setEstudiantes((prev) =>
      prev.map((e) =>
        e.id === estudianteMover.id
          ? {
              ...e,
              id_aula: idAulaDestino,
            }
          : e,
      ),
    );

    cerrarMover();
  };

  // Resúmenes
  const totalEstudiantes = estudiantesFiltrados.length;
  const totalConScore = estudiantesFiltrados.filter(
    (e) => e.score_in != null || e.score_out != null,
  ).length;
  const scorePromedio = useMemo(() => {
    const conScore = estudiantesFiltrados.filter((e) => e.score_in != null);
    if (conScore.length === 0) return 0;
    const suma = conScore.reduce((acc, e) => acc + (e.score_in || 0), 0);
    return (suma / conScore.length).toFixed(1);
  }, [estudiantesFiltrados]);

  const getTipoDocLabel = (tipoDocId: number) => {
    const tipo = tiposDoc.find((t) => t.id === tipoDocId);
    return tipo ? tipo.sigla : '—';
  };

  const getAulaLabel = (aulaId: number) => {
    const aula = aulas.find((a) => a.id === aulaId);
    return aula ? `${aula.grado}°${aula.grupo}` : '—';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              Estudiantes
            </CardTitle>
            <CardDescription>
              Gestión de estudiantes registrados en el programa
            </CardDescription>
          </div>
          <button
            onClick={openCreateForm}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-lg whitespace-nowrap flex items-center gap-2 shadow-md transform hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Agregar Estudiante
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300"
            />
          </div>

          <select
            value={selectedAulaId}
            onChange={(e) =>
              setSelectedAulaId(
                e.target.value === 'all' ? 'all' : Number(e.target.value),
              )
            }
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:border-green-300 bg-white font-medium"
          >
            <option value="all">Todas las aulas</option>
            {aulas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.grado}°{a.grupo}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Estudiante
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Documento
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Aula
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Score IN
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Score OUT
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.length > 0 ? (
                estudiantesFiltrados.map((estudiante, index) => (
                  <tr
                    key={estudiante.id}
                    className={`border-b border-gray-200 transition-colors hover:bg-green-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                          {estudiante.nombres.charAt(0)}
                          {estudiante.apellidos.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {estudiante.nombres} {estudiante.apellidos}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getAulaLabel(estudiante.id_aula)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                          {getTipoDocLabel(estudiante.tipo_doc)}
                        </span>
                        <div className="text-gray-600 mt-1">
                          {estudiante.num_doc}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                        {getAulaLabel(estudiante.id_aula)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {estudiante.score_in != null ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-700 font-semibold text-sm">
                          {estudiante.score_in}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {estudiante.score_out != null ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                          {estudiante.score_out}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirMover(estudiante)}
                          title="Mover de aula"
                          className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                        >
                          <MoveRight className="w-4 h-4" />
                          Mover
                        </button>
                        <button
                          onClick={() => openEditForm(estudiante)}
                          title="Editar"
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(estudiante.id)}
                          title="Eliminar"
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No hay estudiantes que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen estadístico */}
        {estudiantesFiltrados.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">
                    Total Estudiantes
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {totalEstudiantes}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400 opacity-70" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">
                    Con Scores
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {totalConScore}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-emerald-400 opacity-70" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-semibold">
                    Score Promedio (IN)
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {scorePromedio}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-purple-400 opacity-70" />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal crear/editar */}
      {isFormOpen && (
        <EstudiantesForm
          isEditing={isEditing}
          formData={formData}
          tiposDoc={tiposDoc}
          aulas={aulas}
          formError={formError}
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
        />
      )}

      {/* Mover de aula */}
      <MoverEstudianteForm
        isOpen={isMoverOpen}
        estudiante={estudianteMover}
        aulaActual={aulaActual}
        aulasDestino={aulasDestino}
        onClose={cerrarMover}
        onConfirm={handleConfirmMover}
      />
    </Card>
  );
};

export default EstudiantesTab;
