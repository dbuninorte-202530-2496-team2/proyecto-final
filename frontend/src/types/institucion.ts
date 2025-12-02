export type Jornada = 'UNICA_MANANA' | 'UNICA_TARDE' | 'MANANA_Y_TARDE';

export interface Institucion {
  id: number;
  nombre: string;
  correo: string;
  jornada: Jornada;
  nombre_contacto: string;
  telefono_contacto: string;
}

export interface InstitucionFormData {
  nombre: string;
  correo: string;
  jornada: Jornada;
  nombre_contacto: string;
  telefono_contacto: string;
}

// Helper para convertir jornadas array a string y viceversa
export const jornadaArrayToString = (jornadas: Jornada[]): string => {
  return jornadas.join(',');
};

export const jornadaStringToArray = (jornadaStr: string): Jornada[] => {
  if (!jornadaStr) return [];
  return jornadaStr.split(',').filter(Boolean) as Jornada[];
};