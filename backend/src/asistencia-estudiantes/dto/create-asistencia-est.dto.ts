import { ApiProperty } from '@nestjs/swagger';

export class CreateAsistenciaEstDto {
  @ApiProperty({ example: '2025-03-04' })
  fecha_real: string;

  @ApiProperty({ example: true })
  presente: boolean;

  @ApiProperty({ example: 15 })
  id_estudiante: number;

  @ApiProperty({ example: 4 })
  id_aula: number;

  @ApiProperty({ example: 3 })
  id_horario: number;
}
