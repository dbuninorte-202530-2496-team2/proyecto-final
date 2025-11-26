import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum Jornada {
  MAÑANA = 'MAÑANA',
  TARDE = 'TARDE',
  UNICA = 'UNICA',
  MIXTA = 'MIXTA',
}

export class CreateInstitucionDto {
  @ApiProperty({
    description: 'Nombre de la institución educativa',
    example: 'Colegio San Francisco',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico de la institución',
    example: 'contacto@colegiosanfrancisco.edu.co',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  correo?: string;

  @ApiProperty({
    description: 'Jornada(s) de la institución',
    enum: Jornada,
    example: 'MIXTA',
  })
  @IsEnum(Jornada)
  @IsNotEmpty()
  jornada: Jornada;

  @ApiProperty({
    description: 'Nombre de la persona de contacto',
    example: 'María González',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre_contacto?: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+57 300 123 4567',
    required: false,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono_contacto?: string;
}