import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { BarChart3, FileText, ClipboardList } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

import ReportesTutorTab from './ReportesTutorTab';
import ReportesAcademicosTab from './ReportesAcademicosTab';

const ReportesTab: React.FC = () => {
  const { rol } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(rol === 'TUTOR' ? 'mis-reportes' : 'academicos');

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Módulo de Reportes
              </CardTitle>
              <CardDescription className="text-base">
                Centro unificado de informes, estadísticas y seguimiento académico.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {rol === 'TUTOR' ? (
            <ReportesTutorTab />
          ) : (
            <Tabs defaultValue={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-8 bg-white p-1 rounded-xl border border-gray-200 shadow-sm h-auto">
                {/* Tab de Autogestión/Gestión de Tutor - Visible para TODOS */}
                <TabsTrigger
                  value="mis-reportes"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                >
                  <ClipboardList className="w-4 h-4" />
                  Reporte de Tutor
                </TabsTrigger>

                <TabsTrigger
                  value="academicos"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                >
                  <FileText className="w-4 h-4" />
                  Reportes Académicos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mis-reportes" className="mt-0 focus-visible:outline-none">
                <ReportesTutorTab />
              </TabsContent>

              <TabsContent value="academicos" className="mt-0 focus-visible:outline-none">
                <ReportesAcademicosTab />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportesTab;
