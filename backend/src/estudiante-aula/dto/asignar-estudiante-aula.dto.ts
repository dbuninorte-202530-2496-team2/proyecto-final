import { ApiProperty } from '@nestjs/swagger';

export class AsignarEstudianteAulaDto {
  @ApiProperty({ example: 4 })
  id_aula: number;

  @ApiProperty({ example: '2025-02-15' })
  fecha_asignado: string;
}
