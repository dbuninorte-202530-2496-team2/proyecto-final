import { ApiProperty } from '@nestjs/swagger';

export class NotaEntity {
    @ApiProperty({ description: 'ID de la nota' })
    id: number;

    @ApiProperty({ description: 'Valor de la nota (0 - 5)' })
    valor: number;

    @ApiProperty({ description: 'Comentario sobre la nota', nullable: true })
    comentario: string;

    @ApiProperty({ description: 'ID del tutor que registró la nota' })
    id_tutor: number;

    @ApiProperty({ description: 'ID del componente evaluado' })
    id_comp: number;

    @ApiProperty({ description: 'ID del estudiante' })
    id_estudiante: number;
}

