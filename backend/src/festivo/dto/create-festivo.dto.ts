import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateFestivoDto {
    @ApiProperty({ example: '2025-12-25', description: 'Fecha del festivo' })
    @IsDateString()
    @IsNotEmpty()
    fecha: string;

    @ApiProperty({ example: 'Navidad', description: 'Descripción del festivo' })
    @IsString()
    @IsNotEmpty()
    descripcion: string;
}
