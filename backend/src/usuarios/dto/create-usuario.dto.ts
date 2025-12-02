import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
    @ApiProperty({
        description: 'Nombre de usuario',
        example: 'juanp',
    })
    @IsString()
    @IsNotEmpty()
    usuario: string;

    @ApiProperty({
        description: 'Contraseña del usuario (opcional)',
        example: '123456',
        minLength: 6,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    contrasena?: string;
}
