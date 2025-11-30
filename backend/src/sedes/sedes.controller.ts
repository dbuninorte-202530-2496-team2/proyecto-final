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
import { SedesService } from './sedes.service';
import { CreateSedeDto, UpdateSedeDto } from './dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { SedeEntity } from './entitites/sede.entity';

@Auth()
@ApiTags('Sedes')
@Controller()
export class SedesController {
  constructor(private readonly sedesService: SedesService) { }

  @Post('sedes')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva sede',
    description: 'Crea una sede asociada a una institución. Accesible por ADMINISTRATIVO y ADMINISTRADOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sede creada exitosamente',
    type: SedeEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o sede ya existe',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedesService.create(createSedeDto);
  }

  @Get('sedes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las sedes',
    description: 'Retorna lista de todas las sedes con información de su institución. Accesible por todos los roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sedes',
    type: [SedeEntity],
  })
  findAll() {
    return this.sedesService.findAll();
  }

  @Get('sedes/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una sede por ID',
    description: 'Retorna información detallada de una sede. Accesible por todos los roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sede',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sede encontrada',
    type: SedeEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Sede no encontrada',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.findOne(id);
  }

  @Get('instituciones/:id_inst/sedes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener sedes de una institución',
    description: 'Retorna todas las sedes asociadas a una institución específica. Accesible por todos los roles.',
  })
  @ApiParam({
    name: 'id_inst',
    description: 'ID de la institución',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sedes de la institución',
    type: [SedeEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Institución no encontrada',
  })
  findByInstitucion(@Param('id_inst', ParseIntPipe) id_inst: number) {
    return this.sedesService.findByInstitucion(id_inst);
  }

  @Put('sedes/:id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar una sede',
    description: 'Actualiza datos de una sede. Accesible por ADMINISTRATIVO y ADMINISTRADOR.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sede a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sede actualizada',
    type: SedeEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Sede no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSedeDto: UpdateSedeDto,
  ) {
    return this.sedesService.update(id, updateSedeDto);
  }

  @Delete('sedes/:id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una sede',
    description: 'Elimina una sede del sistema. No se puede eliminar si tiene aulas asociadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sede a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sede eliminada',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene registros asociados',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Sede no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.remove(id);
  }
}