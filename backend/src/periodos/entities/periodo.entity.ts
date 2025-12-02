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

    @ApiProperty({
        description: 'Número del periodo en el año (1 para primer semestre, 2 para segundo)',
        example: 1,
    })
    numero: number;
}