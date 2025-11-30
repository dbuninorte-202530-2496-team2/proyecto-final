import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsIn } from 'class-validator';

export class CreateHorarioDto {
    @ApiProperty({
        example: 'LU',
        description: 'Día de la semana',
        enum: ['LU', 'MA', 'MI', 'JU', 'VI', 'SA']
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['LU', 'MA', 'MI', 'JU', 'VI', 'SA'], {
        message: 'El día debe ser uno de: LU, MA, MI, JU, VI, SA'
    })
    dia_sem: string;

    @ApiProperty({
        example: '08:00',
        description: 'Hora de inicio (formato HH:MM en 24h)',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'La hora de inicio debe tener formato HH:MM (24h)'
    })
    hora_ini: string;

    @ApiProperty({
        example: '08:40',
        description: 'Hora de fin (formato HH:MM en 24h). La duración debe ser 40, 45, 50, 55 o 60 minutos.'
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'La hora de fin debe tener formato HH:MM (24h)'
    })
    hora_fin: string;
}
