import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDateString, IsBoolean, IsOptional, ValidateIf } from 'class-validator';

export class CreateAsistenciaTutDto {
  @ApiProperty({
    description: 'Fecha real de la clase (formato: YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha real debe tener formato YYYY-MM-DD' })
  fecha_real: string;

  @ApiProperty({
    description: 'Indica si el tutor dictó la clase',
    example: true,
  })
  @IsBoolean({ message: 'dictoClase debe ser un valor booleano' })
  dictoClase: boolean;

  @ApiProperty({
    description: 'ID del tutor',
    example: 5,
  })
  @IsInt({ message: 'El ID del tutor debe ser un número entero' })
  @IsPositive({ message: 'El ID del tutor debe ser positivo' })
  id_tutor: number;

  @ApiProperty({
    description: 'ID del aula',
    example: 1,
  })
  @IsInt({ message: 'El ID del aula debe ser un número entero' })
  @IsPositive({ message: 'El ID del aula debe ser positivo' })
  id_aula: number;

  @ApiProperty({
    description: 'ID del horario',
    example: 3,
  })
  @IsInt({ message: 'El ID del horario debe ser un número entero' })
  @IsPositive({ message: 'El ID del horario debe ser positivo' })
  id_horario: number;

  @ApiProperty({
    description: 'ID del motivo de inasistencia (requerido si dictoClase = false)',
    example: 2,
    required: false,
  })
  @ValidateIf(o => o.dictoClase === false)
  @IsInt({ message: 'El ID del motivo debe ser un número entero' })
  @IsPositive({ message: 'El ID del motivo debe ser positivo' })
  @IsOptional()
  id_motivo?: number;

  @ApiProperty({
    description: 'Fecha de reposición de la clase (formato: YYYY-MM-DD). Sin validaciones, se asume que la reposición ya ocurrió.',
    example: '2024-02-20',
    required: false,
  })
  @IsDateString({}, { message: 'La fecha de reposición debe tener formato YYYY-MM-DD' })
  @IsOptional()
  fecha_reposicion?: string;
}