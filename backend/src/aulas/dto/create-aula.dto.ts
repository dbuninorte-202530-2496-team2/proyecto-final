import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateAulaDto {
  @ApiProperty({
    description: 'Grado del aula (solo 4, 5, 9, 10)',
    enum: [4, 5, 9, 10],
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  @IsIn([4, 5, 9, 10], { message: 'El grado debe ser 4, 5, 9 o 10' })
  grado: 4 | 5 | 9 | 10;

  @ApiProperty({
    description: 'Número de grupo del aula',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  grupo: number;

  @ApiProperty({
    description: 'ID de la sede a la que pertenece',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_sede: number;
}