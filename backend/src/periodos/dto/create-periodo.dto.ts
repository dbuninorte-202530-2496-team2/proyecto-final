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

  @ApiProperty({
  description: 'Número del periodo académico dentro del año',
  example: 1,
  minimum: 1,
})
@IsInt({ message: 'El número de periodo debe ser un entero' })
@IsPositive({ message: 'El número de periodo debe ser positivo' })
@Min(1, { message: 'El número mínimo de periodo es 1' })
numero: number;

}