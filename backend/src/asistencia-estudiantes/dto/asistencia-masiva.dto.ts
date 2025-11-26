import { ApiProperty } from '@nestjs/swagger';

export class AsistenciaMasivaDto {
  @ApiProperty({ example: '2025-03-04' })
  fecha_real: string;

  @ApiProperty({ example: 4 })
  id_aula: number;

  @ApiProperty({ example: 3 })
  id_horario: number;

  @ApiProperty({
    example: [5, 7, 12],
    description: 'IDs de estudiantes presentes'
  })
  estudiantes_presentes: number[];
}
