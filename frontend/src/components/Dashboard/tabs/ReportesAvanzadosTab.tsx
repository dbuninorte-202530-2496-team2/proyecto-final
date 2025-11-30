import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { BarChart3, FileText, User, Award } from 'lucide-react';
import ReporteAsistenciaAula from './ReporteAsistenciaAula';
import ReporteAsistenciaEstudiante from './ReporteAsistenciaEstudiante';
import BoletinCalificaciones from './BoletinCalificaciones';

const ReportesAvanzadosTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        Reportes Avanzados
                    </CardTitle>
                    <CardDescription>
                        Informes detallados de asistencia, seguimiento individual y calificaciones
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="asistencia-aula" className="w-full">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
                            <TabsTrigger value="asistencia-aula" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Asistencia por Aula
                            </TabsTrigger>
                            <TabsTrigger value="asistencia-estudiante" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Asistencia por Estudiante
                            </TabsTrigger>
                            <TabsTrigger value="boletin" className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Boletín de Calificaciones
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="asistencia-aula" className="mt-0">
                            <ReporteAsistenciaAula />
                        </TabsContent>

                        <TabsContent value="asistencia-estudiante" className="mt-0">
                            <ReporteAsistenciaEstudiante />
                        </TabsContent>

                        <TabsContent value="boletin" className="mt-0">
                            <BoletinCalificaciones />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportesAvanzadosTab;
