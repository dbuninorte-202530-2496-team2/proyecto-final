import { ApiProperty } from '@nestjs/swagger';

export class AulaEntity {
  @ApiProperty({
    description: 'ID único del aula',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Grado del aula',
    enum: [4, 5, 9, 10],
    example: 5,
  })
  grado: 4 | 5 | 9 | 10;

  @ApiProperty({
    description: 'Número de grupo',
    example: 1,
  })
  grupo: number;

  @ApiProperty({
    description: 'ID de la sede',
    example: 1,
  })
  id_sede: number;

  @ApiProperty({
    description: 'Tipo de programa (calculado según grado: 4-5 = INSIDECLASSROOM, 9-10 = OUTSIDECLASSROOM)',
    enum: ['INSIDECLASSROOM', 'OUTSIDECLASSROOM'],
    example: 'INSIDECLASSROOM',
  })
  tipo_programa: 'INSIDECLASSROOM' | 'OUTSIDECLASSROOM';

  @ApiProperty({
    description: 'Nombre de la sede (solo en GET)',
    example: 'Sede Principal',
    required: false,
  })
  sede_nombre?: string;

  @ApiProperty({
    description: 'Nombre de la institución (solo en GET)',
    example: 'Colegio San Francisco',
    required: false,
  })
  institucion_nombre?: string;
}