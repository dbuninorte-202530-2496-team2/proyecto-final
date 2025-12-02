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

  @Get('tutores/:id_tutor/clases-programadas')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener clases programadas de un tutor',
    description: 'Retorna todas las clases programadas para un tutor en un rango de fechas, indicando si tienen asistencia registrada o están pendientes. Permite visualizar el cumplimiento del tutor.'
  })
  @ApiParam({
    name: 'id_tutor',
    description: 'ID del tutor',
    example: 5,
  })
  @ApiQuery({
    name: 'fecha_inicio',
    description: 'Fecha de inicio del rango (formato: YYYY-MM-DD)',
    required: true,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fecha_fin',
    description: 'Fecha de fin del rango (formato: YYYY-MM-DD)',
    required: true,
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Clases programadas obtenidas exitosamente con estado de asistencia',
    schema: {
      example: [
        {
          fecha_programada: '2024-11-25',
          id_aula: 1,
          aula_info: '5°1',
          sede_nombre: 'Sede Principal',
          id_horario: 3,
          horario_info: 'LU 08:00-10:00',
          id_semana: 10,
          tiene_asistencia: true,
          id_asistencia: 15,
          dicto_clase: true,
          id_motivo: null,
          descripcion_motivo: null,
          fecha_reposicion: null
        },
        {
          fecha_programada: '2024-11-27',
          id_aula: 1,
          aula_info: '5°1',
          sede_nombre: 'Sede Principal',
          id_horario: 2,
          horario_info: 'MI 10:00-12:00',
          id_semana: 10,
          tiene_asistencia: false,
          id_asistencia: null,
          dicto_clase: null,
          id_motivo: null,
          descripcion_motivo: null,
          fecha_reposicion: null
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Tutor no encontrado' })
  findClasesProgramadas(
    @Param('id_tutor', ParseIntPipe) id_tutor: number,
    @Query('fecha_inicio') fecha_inicio: string,
    @Query('fecha_fin') fecha_fin: string,
  ) {
    return this.asistenciaTutorService.findClasesProgramadas(
      id_tutor,
      fecha_inicio,
      fecha_fin
    );
  }

  @Get('tutores/:id_tutor/earliest-week')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener fecha más temprana de semana para un tutor',
    description: 'Retorna la fecha de inicio de la semana más temprana en la que el tutor tiene clases programadas. Útil para inicializar el rango de fechas.'
  })
  @ApiParam({
    name: 'id_tutor',
    description: 'ID del tutor',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Fecha más temprana obtenida exitosamente',
    schema: {
      example: {
        earliest_date: '2024-01-08'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Tutor no encontrado' })
  async getEarliestWeekDate(
    @Param('id_tutor', ParseIntPipe) id_tutor: number,
  ) {
    const earliest_date = await this.asistenciaTutorService.getEarliestWeekDate(id_tutor);
    return { earliest_date };
  }


}