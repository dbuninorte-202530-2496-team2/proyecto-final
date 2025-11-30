export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  id_inst: number;
  is_principal: boolean;
}

export interface SedeFormData {
  nombre: string;
  direccion: string;
  id_inst: number;
  is_principal: boolean;
}

export interface SedeConInstitucion extends Sede {
  nombreInstitucion?: string;
}