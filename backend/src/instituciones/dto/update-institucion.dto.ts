import { PartialType } from '@nestjs/swagger';
import { CreateInstitucionDto } from './create-institucion.dto';

export class UpdateInstitucionDto extends PartialType(CreateInstitucionDto) {}