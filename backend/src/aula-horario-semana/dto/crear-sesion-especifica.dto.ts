import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString } from 'class-validator';

export class CrearSesionEspecificaDto {
  @ApiProperty({
    description: 'ID del horario para la sesión',
    example: 1,
  })
  @IsInt({ message: 'El ID del horario debe ser un número entero' })
  @IsPositive({ message: 'El ID del horario debe ser positivo' })
  id_horario: number;

  @ApiProperty({
    description: 'Fecha específica de la sesión (formato: YYYY-MM-DD). Se calculará automáticamente a qué semana pertenece.',
    example: '2024-03-15',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha: string;
}