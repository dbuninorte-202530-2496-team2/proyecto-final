import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { EstudianteAulaService } from './estudiante-aula.service';
import { AsignarEstudianteAulaDto } from './dto/asignar-estudiante-aula.dto';
import { MoverEstudianteDto } from './dto/mover-estudiante.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { EstudianteAulaEntity } from './entities/estudiante-aula.entity';

@ApiTags('Estudiante-Aula')
@Controller('estudiantes')
export class EstudianteAulaController {
  constructor(private readonly estudianteAulaService: EstudianteAulaService) {}

  // ----------------------------
  // ASIGNAR AULA
  // ----------------------------

  @Post(':id_estudiante/aulas')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar estudiante a un aula' })
  asignar(
    @Param('id_estudiante', ParseIntPipe) id_estudiante: number,
    @Body() dto: AsignarEstudianteAulaDto,
  ) {
    return this.estudianteAulaService.asignarEstudiante(id_estudiante, dto);
  }

  // ----------------------------
  // MOVER ENTRE AULAS
  // ----------------------------

  @Put(':id_estudiante/aulas/mover')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mover estudiante entre aulas' })
  mover(
    @Param('id_estudiante', ParseIntPipe) id_estudiante: number,
    @Body() dto: MoverEstudianteDto,
  ) {
    return this.estudianteAulaService.moverEstudiante(id_estudiante, dto);
  }

  // ----------------------------
  // HISTÓRICO DE AULAS
  // ----------------------------

  @Get(':id_estudiante/aulas-historico')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener histórico de aulas del estudiante' })
  @ApiResponse({ status: 200, type: [EstudianteAulaEntity] })
  historico(
    @Param('id_estudiante', ParseIntPipe) id_estudiante: number,
  ) {
    return this.estudianteAulaService.obtenerHistorico(id_estudiante);
  }
}
