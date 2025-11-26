import { ApiProperty } from '@nestjs/swagger';

export class AsistenciaTutEntity {
  @ApiProperty({
    description: 'ID único de la asistencia',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Fecha real de la clase',
    example: '2024-01-15',
    type: String,
  })
  fecha_real: string;

  @ApiProperty({
    description: 'Indica si el tutor dictó la clase',
    example: true,
  })
  dictoClase: boolean;

  @ApiProperty({
    description: 'Fecha de reposición de la clase (si aplica)',
    example: '2024-02-20',
    type: String,
    required: false,
    nullable: true,
  })
  fecha_reposicion?: string;

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
    description: 'ID del horario',
    example: 3,
  })
  id_horario: number;

  @ApiProperty({
    description: 'ID de la semana',
    example: 10,
  })
  id_semana: number;

  @ApiProperty({
    description: 'ID del motivo de inasistencia',
    example: 2,
    required: false,
    nullable: true,
  })
  id_motivo?: number;

  // Campos adicionales para los JOINs
  @ApiProperty({
    description: 'Nombre del tutor',
    example: 'Juan Pérez',
    required: false,
  })
  nombre_tutor?: string;

  @ApiProperty({
    description: 'Descripción del motivo',
    example: 'Festivo',
    required: false,
  })
  descripcion_motivo?: string;

  @ApiProperty({
    description: 'Día de la semana',
    example: 'LU',
    required: false,
  })
  dia_sem?: string;

  @ApiProperty({
    description: 'Hora de inicio',
    example: '08:00:00',
    required: false,
  })
  hora_ini?: string;

  @ApiProperty({
    description: 'Hora de fin',
    example: '09:00:00',
    required: false,
  })
  hora_fin?: string;
}