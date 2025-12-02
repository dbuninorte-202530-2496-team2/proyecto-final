import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs';
import { GestionRoles } from './GestionRoles';
import { GestionUsuarios } from './GestionUsuarios';
import { Shield, Users, Lock } from 'lucide-react';

export const SeguridadTab: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                        <Lock className="w-6 h-6 text-indigo-700" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Seguridad y Acceso
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            Gestión centralizada de usuarios, roles y permisos del sistema.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="usuarios" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                        <TabsTrigger value="usuarios" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Usuarios
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Roles y Perfiles
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="usuarios">
                        <GestionUsuarios />
                    </TabsContent>

                    <TabsContent value="roles">
                        <GestionRoles />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
