import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AsignarHorarioBulkDto {
    @ApiProperty({
        description: 'ID del horario a asignar',
        example: 1,
    })
    @IsInt({ message: 'El ID del horario debe ser un número entero' })
    @IsPositive({ message: 'El ID del horario debe ser positivo' })
    id_horario: number;

    @ApiProperty({
        description: 'ID del periodo para asignar a todas sus semanas',
        example: 1,
    })
    @IsInt({ message: 'El ID del periodo debe ser un número entero' })
    @IsPositive({ message: 'El ID del periodo debe ser positivo' })
    id_periodo: number;
}
