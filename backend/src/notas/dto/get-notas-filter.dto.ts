import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNotasFilterDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID de estudiante' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_estudiante?: number;

    @ApiPropertyOptional({ description: 'Filtrar por ID de componente' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_componente?: number;

    @ApiPropertyOptional({ description: 'Filtrar por ID de aula' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_aula?: number;

    @ApiPropertyOptional({ description: 'Filtrar por ID de periodo' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_periodo?: number;
}
