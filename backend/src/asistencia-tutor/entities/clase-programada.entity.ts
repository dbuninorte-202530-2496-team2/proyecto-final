import { ApiProperty } from '@nestjs/swagger';

export class ClaseProgramadaEntity {
    @ApiProperty({
        description: 'Fecha programada de la clase (fecha_ini de la semana)',
        example: '2024-11-25',
    })
    fecha_programada: string;

    @ApiProperty({
        description: 'ID del aula',
        example: 1,
    })
    id_aula: number;

    @ApiProperty({
        description: 'Información del aula (grado y grupo)',
        example: '5°1',
    })
    aula_info: string;

    @ApiProperty({
        description: 'Nombre de la sede',
        example: 'Sede Principal',
    })
    sede_nombre: string;

    @ApiProperty({
        description: 'ID del horario',
        example: 3,
    })
    id_horario: number;

    @ApiProperty({
        description: 'Información del horario (día, hora inicio y fin)',
        example: 'LU 08:00-10:00',
    })
    horario_info: string;

    @ApiProperty({
        description: 'ID de la semana',
        example: 10,
    })
    id_semana: number;

    @ApiProperty({
        description: 'Indica si tiene asistencia registrada',
        example: true,
    })
    tiene_asistencia: boolean;

    @ApiProperty({
        description: 'ID de la asistencia (null si no tiene)',
        example: 15,
        required: false,
    })
    id_asistencia?: number | null;

    @ApiProperty({
        description: 'Indica si el tutor dictó la clase (null si no hay registro)',
        example: true,
        required: false,
    })
    dicto_clase?: boolean | null;

    @ApiProperty({
        description: 'ID del motivo de inasistencia (null si dictó clase o no hay registro)',
        example: 2,
        required: false,
    })
    id_motivo?: number | null;

    @ApiProperty({
        description: 'Descripción del motivo de inasistencia',
        example: 'Enfermedad',
        required: false,
    })
    descripcion_motivo?: string | null;

    @ApiProperty({
        description: 'Fecha de reposición (null si no aplica)',
        example: '2024-12-02',
        required: false,
    })
    fecha_reposicion?: string | null;
}
