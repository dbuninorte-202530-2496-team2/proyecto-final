import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class AsignarAulaDto {
    @ApiProperty({ example: 1, description: 'ID del aula' })
    @IsNumber()
    id_aula: number;

    @ApiProperty({ example: '2025-02-01', required: false })
    @IsDateString()
    @IsOptional()
    fecha_asignado?: string;
}
