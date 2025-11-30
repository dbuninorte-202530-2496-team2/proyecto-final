import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateComponenteDto {
    @ApiProperty({ example: 'Examen Parcial', description: 'Nombre del componente' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 1, description: 'Tipo de programa (1: INSIDE, 2: OUTSIDE)' })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(2)
    tipo_programa: number;

    @ApiProperty({ example: 30, description: 'Porcentaje del componente (0-100)' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    porcentaje: number;

    @ApiProperty({ example: 1, description: 'ID del periodo al que pertenece' })
    @IsNumber()
    @IsNotEmpty()
    id_periodo: number;
}
