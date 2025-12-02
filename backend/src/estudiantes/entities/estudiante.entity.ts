import { ApiProperty } from '@nestjs/swagger';

export class EstudianteEntity {
  @ApiProperty({ example: 15 })
  id: number;

  @ApiProperty({ example: 'E2025301' })
  codigo: string;

  @ApiProperty({ example: 'María' })
  nombre: string;

  @ApiProperty({ example: 'González' })
  apellidos: string;

  @ApiProperty({ example: 1, description: 'Tipo de documento (FK)' })
  tipo_doc: number;

  @ApiProperty({ example: 10, required: false })
  score_in?: number;

  @ApiProperty({ example: 8, required: false })
  score_out?: number;
}
