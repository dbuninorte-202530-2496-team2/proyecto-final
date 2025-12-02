import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateNotaDto {
    @ApiProperty({ example: 85, description: 'Valor de la nota (0 - 100)' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    valor: number;

    @ApiPropertyOptional({ example: 'Corrección realizada', description: 'Comentario sobre la nota' })
    @IsString()
    @IsOptional()
    comentario?: string;
}
