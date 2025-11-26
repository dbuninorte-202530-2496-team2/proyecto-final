import { ApiProperty } from '@nestjs/swagger';

export class AsistenciaEstudianteEntity {
  @ApiProperty({ example: 350 })
  id: number;

  @ApiProperty({ example: '2025-03-04' })
  fecha_real: Date;

  @ApiProperty({ example: true })
  presente: boolean;

  @ApiProperty({ example: 15 })
  id_estudiante: number;

  @ApiProperty({ example: 4 })
  id_aula: number;

  @ApiProperty({ example: 2 })
  id_horario: number;

  @ApiProperty({ example: 8 })
  id_semana: number;
}
