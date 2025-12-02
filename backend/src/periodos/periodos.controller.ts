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
import { PeriodosService } from './periodos.service';
import { CreatePeriodoDto, UpdatePeriodoDto, GenerarSemanasDto } from './dto';
import { PeriodoEntity, SemanaEntity } from './entities';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Periodos y Semanas')
@Controller('periodos')
export class PeriodosController {
  constructor(private readonly periodosService: PeriodosService) { }

  @Post()
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo periodo',
    description: 'Crea un nuevo periodo académico. Solo accesible por ADMINISTRADOR.'
  })
  @ApiResponse({
    status: 201,
    description: 'Periodo creado exitosamente',
    type: PeriodoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un periodo para ese año',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.periodosService.create(createPeriodoDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los periodos',
    description: 'Retorna una lista de todos los periodos académicos ordenados por año descendente.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de periodos obtenida exitosamente',
    type: [PeriodoEntity],
  })
  findAll() {
    return this.periodosService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un periodo por ID',
    description: 'Retorna la información de un periodo específico.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Periodo encontrado',
    type: PeriodoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Periodo no encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.findOne(id);
  }

  @Put(':id')
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un periodo',
    description: 'Actualiza un periodo existente. Solo accesible por ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Periodo actualizado exitosamente',
    type: PeriodoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe otro periodo para ese año',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto,
  ) {
    return this.periodosService.update(id, updatePeriodoDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un periodo',
    description: 'Elimina un periodo del sistema. Solo accesible por ADMINISTRADOR. No se puede eliminar si tiene semanas asociadas.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Periodo eliminado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene semanas asociadas',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.remove(id);
  }

  @Get(':id/semanas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las semanas de un periodo',
    description: 'Retorna una lista de todas las semanas de un periodo específico ordenadas por fecha.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de semanas obtenida exitosamente',
    type: [SemanaEntity],
  })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  findSemanasByPeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.findSemanasByPeriodo(id);
  }

  @Post(':id/generar-semanas')
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generar semanas para un periodo',
    description: 'Genera automáticamente las semanas del periodo. Solo se puede ejecutar una vez por periodo. Solo accesible por ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Semanas generadas exitosamente',
    schema: {
      example: {
        message: 'Se generaron 40 semanas exitosamente',
        semanas_creadas: 40
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'El periodo ya tiene semanas generadas',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  generarSemanas(
    @Param('id', ParseIntPipe) id: number,
    @Body() generarSemanasDto: GenerarSemanasDto,
  ) {
    return this.periodosService.generarSemanas(id, generarSemanasDto);
  }


  @Get(':id/calendario/info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener información del calendario del periodo',
    description: 'Retorna un resumen con fechas de inicio/fin y duración total del calendario.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Información del calendario obtenida exitosamente',
    schema: {
      example: {
        total_semanas: 40,
        primera_semana_inicio: '2024-01-08',
        primera_semana_fin: '2024-01-14',
        ultima_semana_inicio: '2024-10-07',
        ultima_semana_fin: '2024-10-13',
        duracion_dias: 280
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Periodo no encontrado o no tiene semanas generadas',
  })
  getInfoCalendario(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.getInfoCalendario(id);
  }
  @Delete(':id/semanas')
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar todas las semanas de un periodo',
    description: 'Elimina todas las semanas de un periodo. Solo accesible por ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Semanas eliminadas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  removeSemanas(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.removeSemanasByPeriodo(id);
  }
}