import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreateHorarioDto {
    @ApiProperty({ example: 'LU', description: 'Día de la semana' })
    @IsString()
    @IsNotEmpty()
    dia_sem: string;

    @ApiProperty({ example: '08:00', description: 'Hora de inicio' })
    @IsString()
    @IsNotEmpty()
    hora_ini: string;

    @ApiProperty({ example: '10:00', description: 'Hora de fin' })
    @IsString()
    @IsNotEmpty()
    hora_fin: string;
}
