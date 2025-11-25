import { PartialType } from '@nestjs/swagger';
import { CreateAsistenciaTutDto } from './create-asistencia-tut.dto';

export class UpdateAsistenciaTutDto extends PartialType(CreateAsistenciaTutDto) {}