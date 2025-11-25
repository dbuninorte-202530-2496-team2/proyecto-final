import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';

export function SedesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sedes de las Instituciones</CardTitle>
        <CardDescription>
          Gestión de sedes principales y secundarias de cada institución
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tabla de sedes aquí...</p>
        {/* Aquí irá tu componente TablaSedes */}
      </CardContent>
    </Card>
  );
}