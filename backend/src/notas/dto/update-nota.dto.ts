import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateNotaDto {
    @ApiProperty({ example: 4.5, description: 'Valor de la nota (0.0 - 5.0)' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    valor: number;

    @ApiPropertyOptional({ example: 'Corrección realizada', description: 'Comentario sobre la nota' })
    @IsString()
    @IsOptional()
    comentario?: string;
}
