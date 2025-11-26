import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class RegistrarReposicionDto {
  @ApiProperty({
    description: 'Fecha en que se repone la clase (formato: YYYY-MM-DD)',
    example: '2024-02-20',
  })
  @IsDateString({}, { message: 'La fecha de reposición debe tener formato YYYY-MM-DD' })
  fecha_reposicion: string;
}