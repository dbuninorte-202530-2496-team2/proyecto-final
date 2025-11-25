import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';

export function InstitucionesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instituciones Educativas del Distrito (IED)</CardTitle>
        <CardDescription>
          Gestión de las instituciones invitadas al programa GlobalEnglish
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tabla de instituciones aquí...</p>
        {/* Aquí irá tu componente TablaInstituciones */}
      </CardContent>
    </Card>
  );
}
