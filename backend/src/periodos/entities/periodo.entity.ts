import { ApiProperty } from '@nestjs/swagger';

export class PeriodoEntity {
  @ApiProperty({
    description: 'ID único del periodo',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Año del periodo académico',
    example: 2024,
  })
  anho: number;
}