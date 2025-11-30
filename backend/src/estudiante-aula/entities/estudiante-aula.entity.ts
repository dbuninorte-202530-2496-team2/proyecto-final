import { ApiProperty } from '@nestjs/swagger';

export class EstudianteAulaEntity {
  @ApiProperty({ example: 120 })
  id: number;

  @ApiProperty({ example: 15 })
  id_estudiante: number;

  @ApiProperty({ example: 4 })
  id_aula: number;

  @ApiProperty({ example: 1 })
  consec: number;

  @ApiProperty({ example: '2025-02-15' })
  fecha_asignado: Date;

  @ApiProperty({ example: null, nullable: true })
  fecha_desasignado?: Date | null;
}
