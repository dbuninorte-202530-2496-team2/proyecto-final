import { ApiProperty } from '@nestjs/swagger';
import { Jornada } from '../dto/create-institucion.dto';

export class InstitucionEntity {
  @ApiProperty({
    description: 'ID único de la institución',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la institución',
    example: 'Colegio San Francisco',
  })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'contacto@colegiosanfrancisco.edu.co',
  })
  correo: string;

  @ApiProperty({
    description: 'Jornada de la institución',
    enum: Jornada,
    example: 'MANANA_Y_TARDE',
  })
  jornada: Jornada;

  @ApiProperty({
    description: 'Nombre del contacto',
    example: 'María González',
  })
  nombre_contacto: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+57 300 123 4567',
  })
  telefono_contacto: string;
}