import { IsDateString, IsInt, IsOptional, IsArray } from 'class-validator';

export class TomarAsistenciaAulaDto {
  @IsDateString()
  fecha_real: string;

  @IsInt()
  id_aula: number;

  @IsInt()
  id_horario: number;

  @IsInt()
  id_semana: number;

  @IsOptional() @IsArray()
  estudiantes_presentes?: number[]; // array de ids
}
