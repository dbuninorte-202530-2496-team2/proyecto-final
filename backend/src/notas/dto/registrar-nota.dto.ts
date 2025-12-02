import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RegistrarNotaDto {
    @ApiProperty({ example: 1, description: 'ID del estudiante' })
    @IsNumber()
    @IsNotEmpty()
    id_estudiante: number;

    @ApiProperty({ example: 1, description: 'ID del componente' })
    @IsNumber()
    @IsNotEmpty()
    id_componente: number;

    @ApiProperty({ example: 1, description: 'ID del tutor que registra la nota' })
    @IsNumber()
    @IsNotEmpty()
    id_tutor: number;

    @ApiProperty({ example: 85, description: 'Valor de la nota (0 - 100)' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    valor: number;

    @ApiPropertyOptional({ example: 'Buen trabajo', description: 'Comentario opcional sobre la nota' })
    @IsString()
    @IsOptional()
    comentario?: string;
}
