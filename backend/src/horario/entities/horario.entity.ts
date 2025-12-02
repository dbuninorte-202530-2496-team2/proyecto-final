import { ApiProperty } from '@nestjs/swagger';

export class HorarioEntity {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'LU' })
    dia_sem: string;

    @ApiProperty({ example: '08:00' })
    hora_ini: string;

    @ApiProperty({ example: '10:00' })
    hora_fin: string;
}
