export type DiaSemana = 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SA';

export interface Horario {
  id: number;        
  dia_sem: DiaSemana; 
  hora_ini: string;  
  hora_fin: string; 
}