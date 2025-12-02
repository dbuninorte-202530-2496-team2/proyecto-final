import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { BarChart3, FileText, User, Award } from 'lucide-react';
import ReporteAsistenciaAula from './ReporteAsistenciaAula';
import ReporteAsistenciaEstudiante from './ReporteAsistenciaEstudiante';
import BoletinCalificaciones from './BoletinCalificaciones';

const ReportesAcademicosTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        Reportes Académicos
                    </CardTitle>
                    <CardDescription>
                        Informes detallados de asistencia, seguimiento individual y calificaciones
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Tabs defaultValue="asistencia-aula" className="w-full">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 bg-white p-1 rounded-xl border border-gray-200 shadow-sm h-auto">
                            <TabsTrigger
                                value="asistencia-aula"
                                className="flex items-center gap-2 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                            >
                                <FileText className="w-4 h-4" />
                                Asistencia por Aula
                            </TabsTrigger>
                            <TabsTrigger
                                value="asistencia-estudiante"
                                className="flex items-center gap-2 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                            >
                                <User className="w-4 h-4" />
                                Asistencia por Estudiante
                            </TabsTrigger>
                            <TabsTrigger
                                value="boletin"
                                className="flex items-center gap-2 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                            >
                                <Award className="w-4 h-4" />
                                Boletín de Calificaciones
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="asistencia-aula" className="mt-0 focus-visible:outline-none">
                            <ReporteAsistenciaAula />
                        </TabsContent>

                        <TabsContent value="asistencia-estudiante" className="mt-0 focus-visible:outline-none">
                            <ReporteAsistenciaEstudiante />
                        </TabsContent>

                        <TabsContent value="boletin" className="mt-0 focus-visible:outline-none">
                            <BoletinCalificaciones />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportesAcademicosTab;
