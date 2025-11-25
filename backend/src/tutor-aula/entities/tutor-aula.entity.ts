import { ApiProperty } from '@nestjs/swagger';

export class TutorAulaEntity {
  @ApiProperty({
    description: 'ID del tutor',
    example: 5,
  })
  id_tutor: number;

  @ApiProperty({
    description: 'ID del aula',
    example: 1,
  })
  id_aula: number;

  @ApiProperty({
    description: 'Consecutivo de asignación (permite múltiples asignaciones del mismo tutor)',
    example: 1,
  })
  consec: number;

  @ApiProperty({
    description: 'Fecha de asignación',
    example: '2024-01-15',
    type: String,
  })
  fecha_asignado: string;

  @ApiProperty({
    description: 'Fecha de desasignación (null si está activo)',
    example: '2024-06-30',
    type: String,
    required: false,
    nullable: true,
  })
  fecha_desasignado?: string;

  

  //Opcionales para JOINs

  @ApiProperty({
    description: 'Nombre del tutor',
    example: 'Juan Pérez',
    required: false,
  })
  nombre_tutor?: string;

  @ApiProperty({
    description: 'Estado de la asignación',
    example: true,
    required: false,
  })
  activo?: boolean;
}