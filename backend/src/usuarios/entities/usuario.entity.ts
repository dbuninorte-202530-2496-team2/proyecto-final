import { ApiProperty } from '@nestjs/swagger';

export class UsuarioEntity {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'juanp' })
    usuario: string;

    @ApiProperty({ example: 'hashed-password' })
    contrasena: string;
}
