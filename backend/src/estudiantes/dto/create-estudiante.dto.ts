import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  tipo_doc: number;

  @ApiProperty({ example: 85, description: 'Score IN (0-100)', required: false })
  @IsNumber() @IsOptional()
  @Min(0) @Max(100)
  @Type(() => Number)
  score_in?: number;

  @ApiProperty({ example: 90, description: 'Score OUT (0-100)', required: false })
  @IsNumber() @IsOptional()
  @Min(0) @Max(100)
  @Type(() => Number)
  score_out?: number;
}
