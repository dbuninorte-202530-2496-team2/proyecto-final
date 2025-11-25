import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min, Max } from 'class-validator';

export class CreatePeriodoDto {
  @ApiProperty({
    description: 'Año del periodo académico',
    example: 2024,
    minimum: 2020,
    maximum: 2100,
  })
  @IsInt({ message: 'El año debe ser un número entero' })
  @IsPositive({ message: 'El año debe ser positivo' })
  @Min(2020, { message: 'El año debe ser mayor o igual a 2020' })
  @Max(2100, { message: 'El año debe ser menor o igual a 2100' })
  anho: number;
}