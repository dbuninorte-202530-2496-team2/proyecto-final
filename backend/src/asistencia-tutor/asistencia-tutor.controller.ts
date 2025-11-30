// src/asistencia-tutor/asistencia-tutor.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AsistenciaTutorService } from './asistencia-tutor.service';
import {
  CreateAsistenciaTutDto,
  UpdateAsistenciaTutDto
} from './dto';
import { AsistenciaTutEntity } from './entities/asistencia-tut.entity';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Asistencia Tutores')
@Controller('asistencia-tutores')
export class AsistenciaTutorController {
  constructor(private readonly asistenciaTutorService: AsistenciaTutorService) { }

  @Post()
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar asistencia de tutor',
    description: 'Registra la asistencia de un tutor a una clase. Si dictoClase=false, debe incluir id_motivo.'
  })
  @ApiResponse({
    status: 201,
    description: 'Asistencia registrada exitosamente',
    type: AsistenciaTutEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validación fallida o ya existe registro para esta clase',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(@Body() createAsistenciaDto: CreateAsistenciaTutDto) {
    return this.asistenciaTutorService.create(createAsistenciaDto);
  }

  @Get()
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las asistencias de tutores',
    description: 'Retorna una lista de todas las asistencias registradas. Solo accesible por ADMINISTRATIVO y ADMINISTRADOR.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asistencias obtenida exitosamente',
    type: [AsistenciaTutEntity],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll() {
    return this.asistenciaTutorService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una asistencia por ID',
    description: 'Retorna la información de una asistencia específica.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asistencia',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia encontrada',
    type: AsistenciaTutEntity,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Asistencia no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaTutorService.findOne(id);
  }

  @Put(':id')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar una asistencia',
    description: 'Actualiza parcial o totalmente una asistencia existente.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asistencia a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia actualizada exitosamente',
    type: AsistenciaTutEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Validación fallida',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Asistencia no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsistenciaDto: UpdateAsistenciaTutDto,
  ) {
    return this.asistenciaTutorService.update(id, updateAsistenciaDto);
  }

  @Get('tutores/:id_tutor/asistencia')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener asistencias de un tutor',
    description: 'Retorna todas las asistencias de un tutor específico. TUTOR solo puede ver sus propias asistencias.'
  })
  @ApiParam({
    name: 'id_tutor',
    description: 'ID del tutor',
    example: 5,
  })
  @ApiQuery({
    name: 'fecha_inicio',
    description: 'Fecha de inicio del rango (formato: YYYY-MM-DD)',
    required: false,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fecha_fin',
    description: 'Fecha de fin del rango (formato: YYYY-MM-DD)',
    required: false,
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencias del tutor obtenidas exitosamente',
    type: [AsistenciaTutEntity],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Tutor no encontrado' })
  findAsistenciasByTutor(
    @Param('id_tutor', ParseIntPipe) id_tutor: number,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.asistenciaTutorService.findAsistenciasByTutor(
      id_tutor,
      fecha_inicio,
      fecha_fin
    );
  }


}