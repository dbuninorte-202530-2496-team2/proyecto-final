import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive, Min, Max } from 'class-validator';

export class GenerarSemanasDto {
  @ApiProperty({
    description: 'Fecha de inicio de la primera semana (formato: YYYY-MM-DD)',
    example: '2024-01-08',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe tener formato YYYY-MM-DD' })
  fec_ini: string;

  @ApiProperty({
    description: 'Cantidad de semanas a generar',
    example: 40,
    minimum: 1,
    maximum: 52,
  })
  @IsInt({ message: 'La cantidad de semanas debe ser un número entero' })
  @IsPositive({ message: 'La cantidad de semanas debe ser positiva' })
  @Min(1, { message: 'Debe generar al menos 1 semana' })
  @Max(52, { message: 'No se pueden generar más de 52 semanas' })
  cantidad_semanas: number;
}