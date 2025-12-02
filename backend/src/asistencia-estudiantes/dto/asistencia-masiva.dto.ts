import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsArray, ArrayMinSize, IsOptional } from 'class-validator';

export class AsistenciaMasivaDto {
  @ApiProperty({ example: '2025-03-04' })
  @IsString()
  fecha_real: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  id_aula: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  id_horario: number;

  @ApiProperty({
    example: [5, 7, 12],
    description: 'IDs de estudiantes presentes',
    required: false
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  estudiantes_presentes?: number[];
}
