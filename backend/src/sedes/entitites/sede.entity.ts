import { ApiProperty } from '@nestjs/swagger';

export class SedeEntity {
  @ApiProperty({
    description: 'ID único de la sede',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la sede',
    example: 'Sede Principal',
  })
  nombre: string;

  @ApiProperty({
    description: 'Dirección de la sede',
    example: 'Calle 123 #45-67',
    nullable: true,
  })
  direccion: string | null;

  @ApiProperty({
    description: 'ID de la institución',
    example: 1,
  })
  id_inst: number;

  @ApiProperty({
    description: 'Es sede principal',
    example: true,
  })
  is_principal: boolean;

  @ApiProperty({
    description: 'Nombre de la institución (solo en GET)',
    example: 'Colegio San Francisco',
    required: false,
  })
  institucion_nombre?: string;
}