export interface Personal {
  id: number;
  codigo: string;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  tipo_doc: number;
  id_rol: number;
  usuario?: string;
}