import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString, IsOptional } from 'class-validator';

export class CambiarTutorDto {
    @ApiProperty({
        description: 'ID del nuevo tutor (debe tener id_rol = TUTOR)',
        example: 10,
    })
    @IsInt({ message: 'El ID del nuevo tutor debe ser un número entero' })
    @IsPositive({ message: 'El ID del nuevo tutor debe ser positivo' })
    id_tutor_nuevo: number;

    @ApiProperty({
        description: 'Fecha del cambio (desasignación del anterior y asignación del nuevo)',
        example: '2024-02-01',
        required: false,
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de cambio debe tener formato YYYY-MM-DD' })
    fecha_cambio?: string;
}
