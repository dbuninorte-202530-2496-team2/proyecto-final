import { ApiProperty } from '@nestjs/swagger';

export class AulaHorarioSemanaEntity {
  @ApiProperty({
    description: 'ID del aula',
    example: 1,
  })
  id_aula: number;

  @ApiProperty({
    description: 'ID del horario',
    example: 1,
  })
  id_horario: number;

  @ApiProperty({
    description: 'ID de la semana',
    example: 1,
  })
  id_semana: number;

  @ApiProperty({
    description: 'Día de la semana del horario',
    example: 'LU',
    required: false,
  })
  dia_sem?: string;

  @ApiProperty({
    description: 'Hora de inicio del horario',
    example: '08:00:00',
    required: false,
  })
  hora_ini?: string;

  @ApiProperty({
    description: 'Hora de fin del horario',
    example: '09:00:00',
    required: false,
  })
  hora_fin?: string;

  @ApiProperty({
    description: 'Fecha de inicio de la semana',
    example: '2024-01-08',
    required: false,
  })
  fec_ini?: string;

  @ApiProperty({
    description: 'Fecha de fin de la semana',
    example: '2024-01-14',
    required: false,
  })
  fec_fin?: string;
}