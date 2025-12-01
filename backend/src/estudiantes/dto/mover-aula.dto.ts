import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class MoverAulaDto {
    @ApiProperty({ example: 2, description: 'ID del aula destino' })
    @IsNumber()
    id_aula_destino: number;

    @ApiProperty({ example: '2025-03-01', required: false })
    @IsDateString()
    @IsOptional()
    fecha_movimiento?: string;
}
