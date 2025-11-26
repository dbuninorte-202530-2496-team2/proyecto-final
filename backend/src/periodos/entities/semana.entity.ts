import { ApiProperty } from '@nestjs/swagger';

export class SemanaEntity {
  @ApiProperty({
    description: 'ID único de la semana',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Fecha de inicio de la semana',
    example: '2024-01-08',
    type: String,
  })
  fec_ini: string;

  @ApiProperty({
    description: 'Fecha de fin de la semana (calculada automáticamente: fec_ini + 6 días)',
    example: '2024-01-14',
    type: String,
  })
  fec_fin: string;

  @ApiProperty({
    description: 'ID del periodo al que pertenece',
    example: 1,
  })
  id_periodo: number;
}