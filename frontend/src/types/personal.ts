export interface Personal {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  tipo_doc: number; // id del tipo de documento
  num_doc: string;
  id_rol: number;   // id del rol
}