import React from 'react';
import type {
  SupervisionResumenTutor,
  SupervisionDetalleClase,
} from '../../../types/supervision';
import {
  UserCheck,
  CalendarRange,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SupervisionDetalleProps {
  resumen: SupervisionResumenTutor | null;
  clases: SupervisionDetalleClase[];
  fechaDesde?: string;
  fechaHasta?: string;
}

const SupervisionDetalle: React.FC<SupervisionDetalleProps> = ({
  resumen,
  clases,
  fechaDesde,
  fechaHasta,
}) => {
  if (!resumen) {
    return (
      <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">
        Selecciona un tutor y un rango de fechas para ver la supervisión.
      </div>
    );
  }

  const { nombre_tutor, total_programadas, total_con_asistencia, cumplimiento } =
    resumen;

  const hayRango = Boolean(fechaDesde || fechaHasta);

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <p className="text-xs text-emerald-700 font-semibold uppercase">
                Tutor supervisado
              </p>
              <p className="text-sm font-bold text-emerald-900">
                {nombre_tutor}
              </p>
              {hayRango && (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
                  <CalendarRange className="w-3 h-3" />
                  {fechaDesde || 'inicio'} {'→'} {fechaHasta || 'hoy'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-blue-700 font-semibold uppercase">
                Clases con asistencia registrada
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {total_con_asistencia}/{total_programadas}
              </p>
              <p className="text-[11px] text-blue-700 mt-1">
                Clases programadas en el rango seleccionado
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <p className="text-xs text-amber-700 font-semibold uppercase">
                Cumplimiento del tutor
              </p>
              <p className="text-2xl font-bold text-amber-900">
                {cumplimiento.toFixed(1)}%
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                % de clases programadas donde se registró asistencia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de detalle */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Aula
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Horario
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wider">
                Asistencia estudiantes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clases.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500 italic text-sm"
                >
                  No hay clases programadas para el tutor en el rango
                  seleccionado.
                </td>
              </tr>
            ) : (
              clases.map((c, idx) => (
                <tr
                  key={c.id_programacion}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {c.fecha_programada}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {c.aula}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {c.horario}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {c.registro_asistencia === 'CON_REGISTRO' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        ✅ Con registro
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                        ⚠️ Sin registro
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {c.porcentaje_asistencia_estudiantes != null ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                        {c.porcentaje_asistencia_estudiantes.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Sin datos de asistencia
                      </span>
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

export default SupervisionDetalle;
