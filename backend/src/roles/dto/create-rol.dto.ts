import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateRolDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMINISTRADOR',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  nombre: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario con permisos completos del sistema',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}