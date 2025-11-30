import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateTipoDocumentoDto {
    @ApiProperty({
        example: 'CC',
        description: 'Código del tipo de documento',
        maxLength: 11
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 11, { message: 'El código debe tener máximo 11 caracteres' })
    codigo: string;

    @ApiProperty({
        example: 'Cédula de Ciudadanía',
        description: 'Descripción del tipo de documento'
    })
    @IsString()
    @IsNotEmpty()
    descripcion: string;
}
