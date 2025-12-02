import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AulasService } from './aulas.service';
import { CreateAulaDto, UpdateAulaDto } from './dto';
import { AulaEntity } from './entities/aula.entity';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Aulas')
@Controller()
export class AulasController {
  constructor(private readonly aulasService: AulasService) { }

  @Post('aulas')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva aula',
    description: 'Crea un aula con grado (4, 5, 9, 10) y grupo. El tipo_programa se calcula automáticamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Aula creada exitosamente',
    type: AulaEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, grado incorrecto o aula ya existe',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Sede no encontrada' })
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulasService.create(createAulaDto);
  }

  @Get('aulas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las aulas',
    description: 'Retorna todas las aulas con información de sede e institución. Accessible por todos los roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de aulas',
    type: [AulaEntity],
  })
  findAll() {
    return this.aulasService.findAll();
  }

  @Get('aulas/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un aula por ID',
    description: 'Retorna información detallada de un aula. Accessible por todos los roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Aula encontrada',
    type: AulaEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Aula no encontrada',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aulasService.findOne(id);
  }

  @Get('sedes/:id_sede/aulas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener aulas de una sede',
    description: 'Retorna todas las aulas de una sede específica. Accessible por todos los roles.',
  })
  @ApiParam({
    name: 'id_sede',
    description: 'ID de la sede',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Aulas de la sede',
    type: [AulaEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Sede no encontrada',
  })
  findBySede(@Param('id_sede', ParseIntPipe) id_sede: number) {
    return this.aulasService.findBySede(id_sede);
  }

  @Get('aulas/:id/estudiantes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estudiantes de un aula',
    description: 'Retorna todos los estudiantes matriculados en un aula. Accessible por todos los roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes del aula',
  })
  @ApiResponse({
    status: 404,
    description: 'Aula no encontrada',
  })
  findEstudiantes(@Param('id', ParseIntPipe) id: number) {
    return this.aulasService.findEstudiantes(id);
  }

  @Get('aulas/:id/tutores-historico')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener histórico de tutores de un aula',
    description: 'Retorna todos los tutores que han sido asignados al aula. Accessible por todos los roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de tutores',
  })
  @ApiResponse({
    status: 404,
    description: 'Aula no encontrada',
  })
  findTutoresHistorico(@Param('id', ParseIntPipe) id: number) {
    return this.aulasService.findTutoresHistorico(id);
  }

  @Put('aulas/:id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un aula',
    description: 'Actualiza datos de un aula. El tipo_programa se recalcula si cambia el grado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aula a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Aula actualizada',
    type: AulaEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAulaDto: UpdateAulaDto,
  ) {
    return this.aulasService.update(id, updateAulaDto);
  }

  @Delete('aulas/:id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un aula',
    description: 'Elimina un aula del sistema. No se puede eliminar si tiene estudiantes.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aula a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Aula eliminada',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene registros asociados',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.aulasService.remove(id);
  }
}