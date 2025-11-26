import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstudianteDto {
  @ApiProperty({ example: 'E2025301' })
  @IsString() @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'María' })
  @IsString() @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'González' })
  @IsString() @IsNotEmpty()
  apellidos: string;

  @ApiProperty({ example: 1, description: 'FK tipo documento' })
  @IsNumber() @IsNotEmpty()
  tipo_doc: number;

  @ApiProperty({ example: '10203045', required: false })
  @IsString() @IsOptional()
  numero_documento?: string;

  @ApiProperty({ example: '2012-05-14', required: false })
  @IsDateString() @IsOptional()
  fecha_nacimiento?: string;

  @ApiProperty({ example: 4, enum: [4,5,9,10], required: false })
  @IsNumber() @IsOptional() @IsIn([4,5,9,10])
  grado?: number;

  @ApiProperty({ example: 'ACTIVO', required: false })
  @IsString() @IsOptional()
  estado?: string;
}
