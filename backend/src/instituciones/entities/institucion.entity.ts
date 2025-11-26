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
    nullable: true,
  })
  correo: string | null;

  @ApiProperty({
    description: 'Jornada de la institución',
    enum: Jornada,
    example: 'MIXTA',
  })
  jornada: Jornada;

  @ApiProperty({
    description: 'Nombre del contacto',
    example: 'María González',
    nullable: true,
  })
  nombre_contacto: string | null;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+57 300 123 4567',
    nullable: true,
  })
  telefono_contacto: string | null;
}