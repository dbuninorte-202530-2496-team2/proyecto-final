import { PartialType } from '@nestjs/swagger';
import { CreatePeriodoDto } from './create-periodo.dto';

export class UpdatePeriodoDto extends PartialType(CreatePeriodoDto) {}