import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';

export function ConfiguracionTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Festivos</CardTitle>
          <CardDescription>Gestión de días festivos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Tabla de festivos...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Motivos de No Asistencia</CardTitle>
          <CardDescription>Catálogo de motivos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Tabla de motivos...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Periodos</CardTitle>
          <CardDescription>Periodos de evaluación</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Tabla de periodos...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Componentes de Nota</CardTitle>
          <CardDescription>Componentes y porcentajes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Tabla de componentes...</p>
        </CardContent>
      </Card>
    </div>
  );
}