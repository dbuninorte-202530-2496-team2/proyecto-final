import { PartialType } from '@nestjs/mapped-types';
import { CreateFestivoDto } from './create-festivo.dto';

export class UpdateFestivoDto extends PartialType(CreateFestivoDto) { }
