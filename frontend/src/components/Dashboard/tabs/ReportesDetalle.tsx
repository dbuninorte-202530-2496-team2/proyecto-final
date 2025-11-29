import React from 'react';
import type {
  ReporteAulaResumen,
  ReporteEstudianteAula,
} from '../../../types/reportes';
import {
  Users,
  School,
  MapPin,
  BarChart2,
  TrendingUp,
} from 'lucide-react';

interface ReportesDetalleProps {
  aulaResumen: ReporteAulaResumen | null;
  estudiantesDetalle: ReporteEstudianteAula[];
}

const ReportesDetalle: React.FC<ReportesDetalleProps> = ({
  aulaResumen,
  estudiantesDetalle,
}) => {
  if (!aulaResumen) {
    return (
      <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">
        Selecciona una institución, sede y aula para ver el reporte.
      </div>
    );
  }

  const {
    nombre_aula,
    institucion,
    sede,
    total_estudiantes,
    porcentaje_asistencia,
    promedio_inside,
    promedio_outside,
  } = aulaResumen;

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
              <School className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <p className="text-xs text-emerald-700 font-semibold uppercase">
                Aula
              </p>
              <p className="text-sm font-bold text-emerald-900">
                {nombre_aula}
              </p>
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {sede}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase">
                Estudiantes
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {total_estudiantes}
              </p>
              <p className="text-[11px] text-blue-700 mt-1">{institucion}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-green-800" />
            </div>
            <div>
              <p className="text-xs text-green-700 font-semibold uppercase">
                Asistencia promedio
              </p>
              <p className="text-2xl font-bold text-green-900">
                {porcentaje_asistencia.toFixed(1)}%
              </p>
              <p className="text-[11px] text-green-700 mt-1">
                Sobre registros de clase
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-800" />
            </div>
            <div>
              <p className="text-xs text-purple-700 font-semibold uppercase">
                Promedios Inside / Outside
              </p>
              <p className="text-lg font-bold text-purple-900">
                {promedio_inside != null
                  ? `${promedio_inside.toFixed(1)} Inside`
                  : '— Inside'}
              </p>
              <p className="text-sm font-semibold text-indigo-900">
                {promedio_outside != null
                  ? `${promedio_outside.toFixed(1)} Outside`
                  : '— Outside'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE DETALLE POR ESTUDIANTE */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Asistencia
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Inside
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Outside
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estudiantesDetalle.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500 italic text-sm"
                >
                  No hay estudiantes para el aula seleccionada.
                </td>
              </tr>
            ) : (
              estudiantesDetalle.map((est, idx) => (
                <tr
                  key={est.id_estudiante}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {est.nombre_completo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {est.documento}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      {est.porcentaje_asistencia.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {est.promedio_inside != null ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold">
                        {est.promedio_inside.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Sin notas</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {est.promedio_outside != null ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
                        {est.promedio_outside.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Sin notas</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesDetalle;
