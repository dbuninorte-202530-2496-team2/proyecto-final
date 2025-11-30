import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DesasignarTutorDto {
  @ApiProperty({
    description: 'Fecha de desasignación del tutor (formato: YYYY-MM-DD)',
    example: '2024-06-30',
  })
  @IsDateString({}, { message: 'La fecha de desasignación debe tener formato YYYY-MM-DD' })
  fecha_desasignado: string;
}