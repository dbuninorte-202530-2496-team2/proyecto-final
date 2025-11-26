import { ApiProperty } from '@nestjs/swagger';

export class MoverEstudianteDto {
  @ApiProperty({ example: 7 })
  id_aula_destino: number;

  @ApiProperty({ example: '2025-03-01' })
  fecha_desasignado: string;
}
