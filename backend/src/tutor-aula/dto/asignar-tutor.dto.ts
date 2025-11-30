import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString } from 'class-validator';

export class AsignarTutorDto {
  @ApiProperty({
    description: 'ID del tutor (debe tener id_rol = TUTOR)',
    example: 5,
  })
  @IsInt({ message: 'El ID del tutor debe ser un número entero' })
  @IsPositive({ message: 'El ID del tutor debe ser positivo' })
  id_tutor: number;

  @ApiProperty({
    description: 'Fecha de asignación del tutor (formato: YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de asignación debe tener formato YYYY-MM-DD' })
  fecha_asignado: string;
}