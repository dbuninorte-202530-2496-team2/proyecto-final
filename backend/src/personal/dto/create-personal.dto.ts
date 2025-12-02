import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber } from 'class-validator';

export class CreatePersonalDto {
    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @ApiProperty({ example: 'Juan' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 'Pérez', required: false })
    @IsOptional()
    @IsString()
    apellido?: string;

    @ApiProperty({ example: 'juan@example.com', required: false })
    @IsEmail()
    correo: string;

    @ApiProperty({ example: '3001234567', required: false })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    id_rol: number;

    @ApiProperty({ example: 'juanp', required: false })
    @IsOptional()
    @IsString()
    usuario?: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    tipo_doc: number;
}
