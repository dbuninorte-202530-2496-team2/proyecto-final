import { ApiProperty } from '@nestjs/swagger';

export class PersonalEntity {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'P001' })
    codigo: string;

    @ApiProperty({ example: 'Juan' })
    nombre: string;

    @ApiProperty({ example: 'Pérez', required: false })
    apellido?: string;

    @ApiProperty({ example: 'juan@example.com' })
    correo: string;

    @ApiProperty({ example: '3001234567', required: false })
    telefono?: string;

    @ApiProperty({ example: 2 })
    id_rol: number;

    @ApiProperty({ example: 'juanp', required: false })
    usuario?: string;

    @ApiProperty({ example: 1 })
    tipo_doc: number;
}
