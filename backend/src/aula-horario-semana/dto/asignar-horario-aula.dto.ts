import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AsignarHorarioAulaDto {
  @ApiProperty({
    description: 'ID del horario a asignar',
    example: 1,
  })
  @IsInt({ message: 'El ID del horario debe ser un número entero' })
  @IsPositive({ message: 'El ID del horario debe ser positivo' })
  id_horario: number;

  @ApiProperty({
    description: 'ID de la semana desde la cual aplica el horario',
    example: 1,
  })
  @IsInt({ message: 'El ID de la semana debe ser un número entero' })
  @IsPositive({ message: 'El ID de la semana debe ser positivo' })
  id_semana: number;
}