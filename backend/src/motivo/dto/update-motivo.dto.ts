import { PartialType } from '@nestjs/mapped-types';
import { CreateMotivoDto } from './create-motivo.dto';

export class UpdateMotivoDto extends PartialType(CreateMotivoDto) { }
