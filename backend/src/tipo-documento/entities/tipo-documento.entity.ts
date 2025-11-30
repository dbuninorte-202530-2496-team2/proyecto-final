import { ApiProperty } from '@nestjs/swagger';

export class TipoDocumentoEntity {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'CC' })
    codigo: string;

    @ApiProperty({ example: 'Cédula de Ciudadanía' })
    descripcion: string;
}
