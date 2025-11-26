import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { AsistenciaEstudiantesService } from './asistencia-estudiantes.service';
import { CreateAsistenciaEstDto } from './dto/create-asistencia-est.dto';
import { AsistenciaMasivaDto } from './dto/asistencia-masiva.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { AsistenciaEstudianteEntity } from './entities/asistencia-estudiante.entity';

@ApiTags('Asistencia Estudiantes')
@Controller('asistencia-estudiantes')
export class AsistenciaEstudiantesController {
  constructor(
    private readonly asistenciaService: AsistenciaEstudiantesService,
  ) {}

  @Post()
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar asistencia individual de estudiante' })
  @ApiResponse({
    status: 201,
    description: 'Asistencia registrada correctamente',
  })
  registrarAsistencia(@Body() dto: CreateAsistenciaEstDto) {
    return this.asistenciaService.registrarAsistenciaIndividual(dto);
  }

  @Post('masiva')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar asistencia masiva por aula' })
  registrarAsistenciaMasiva(@Body() dto: AsistenciaMasivaDto) {
    return this.asistenciaService.registrarAsistenciaMasiva(dto);
  }

  @Get('estudiante/:id')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener asistencia por estudiante' })
  @ApiParam({ name: 'id', example: 10 })
  @ApiResponse({ status: 200, type: [AsistenciaEstudianteEntity] })
  obtenerPorEstudiante(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.obtenerAsistenciaPorEstudiante(id);
  }

  @Get('aula/:id')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener asistencia por aula' })
  @ApiParam({ name: 'id', example: 3 })
  @ApiResponse({ status: 200, type: [AsistenciaEstudianteEntity] })
  obtenerPorAula(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.obtenerAsistenciaPorAula(id);
  }
}
