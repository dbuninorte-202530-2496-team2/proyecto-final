import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class FiltroFechasDto {
    @ApiPropertyOptional({
        description: 'Fecha de inicio del rango (formato: YYYY-MM-DD)',
        example: '2024-01-01'
    })
    @IsOptional()
    @IsDateString()
    fecha_inicio?: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin del rango (formato: YYYY-MM-DD)',
        example: '2024-12-31'
    })
    @IsOptional()
    @IsDateString()
    fecha_fin?: string;
}
