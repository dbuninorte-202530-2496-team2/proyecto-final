import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/Card';

import {
  ConfiguracionCatalogosBasicos,
  ConfiguracionAcademicaEvaluacion,
} from './ConfiguracionSecciones';
import { ConfiguracionSemanas } from './ConfiguracionSemanas';

const ConfiguracionTab: React.FC = () => {
  return (
    <Card>
      <CardHeader className="animate-fadeIn">
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-blue-100">
                <span className="text-2xl">⚙️</span>
              </div>
              Configuración del Sistema
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Administración de catálogos globales: festivos, motivos de
              ausencia, tipos de documento, períodos académicos y componentes
              de evaluación.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-12">

          <ConfiguracionAcademicaEvaluacion />

          <div className="border-t-2 border-gray-200" />

          <ConfiguracionSemanas />

          <div className="border-t-2 border-gray-200" />

          <ConfiguracionCatalogosBasicos />

        </div>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionTab;

