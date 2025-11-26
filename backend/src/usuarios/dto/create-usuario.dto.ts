import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUsuarioDto {
    @ApiProperty({
        description: 'Nombre de usuario',
        example: 'juanp',
    })
    @IsString()
    @IsNotEmpty()
    usuario: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: '123456',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    contrasena: string;
}
