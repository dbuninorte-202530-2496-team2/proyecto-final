import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateSedeDto {
  @ApiProperty({
    description: 'Nombre de la sede',
    example: 'Sede Principal',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    description: 'Dirección de la sede',
    example: 'Calle 123 #45-67, Bogotá',
    required: false,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccion?: string;

  @ApiProperty({
    description: 'ID de la institución a la que pertenece',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_inst: number;

  @ApiProperty({
    description: 'Indica si es la sede principal',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_principal: boolean;
}