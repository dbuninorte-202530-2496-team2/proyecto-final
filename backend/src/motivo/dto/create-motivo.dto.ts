import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMotivoDto {
    @ApiProperty({ example: 'Falta por motivo de salud', description: 'Descripción del motivo' })
    @IsString()
    @IsNotEmpty()
    descripcion: string;
}
