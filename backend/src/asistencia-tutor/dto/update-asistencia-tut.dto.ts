import { PartialType } from '@nestjs/swagger';
import { CreateAsistenciaTutDto } from './create-asistencia-tut.dto';
import { IsOptional } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateAsistenciaTutDto extends PartialType(
    OmitType(CreateAsistenciaTutDto, ['id_motivo', 'fecha_reposicion'] as const),
) {
    @IsOptional()
    id_motivo?: number | null;

    @IsOptional()
    fecha_reposicion?: string | null;
}
