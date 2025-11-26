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

  @ApiProperty({ example: '10203045', required: false })
  numero_documento?: string;

  @ApiProperty({ example: '2012-05-14', required: false })
  fecha_nacimiento?: Date;

  @ApiProperty({ example: 4, description: 'Grado: 4,5,9,10', required: false })
  grado?: number;

  @ApiProperty({ example: 'ACTIVO', required: false })
  estado?: string;

  @ApiProperty({ example: 10, required: false })
  score_in?: number;

  @ApiProperty({ example: 8, required: false })
  score_out?: number;

  @ApiProperty({ example: '2025-02-10T12:30:00.000Z', required: false })
  created_at?: Date;
}
