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
import { InstitucionesService } from './instituciones.service';
import { CreateInstitucionDto, UpdateInstitucionDto } from './dto';
import { InstitucionEntity } from './entities/institucion.entity';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@Auth()
@ApiTags('Instituciones')
@Controller('instituciones')
export class InstitucionesController {
  constructor(private readonly institucionesService: InstitucionesService) { }

  @Post()
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva institución educativa',
    description: 'Crea una nueva IED en el sistema. Accesible por ADMINISTRATIVO y ADMINISTRADOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Institución creada exitosamente',
    type: InstitucionEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o institución ya existe',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(@Body() createInstitucionDto: CreateInstitucionDto) {
    return this.institucionesService.create(createInstitucionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las instituciones',
    description: 'Retorna lista de todas las IED. Accesible por todos los roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de instituciones',
    type: [InstitucionEntity],
  })
  findAll() {
    return this.institucionesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una institución por ID',
    description: 'Retorna información detallada de una IED. Accesible por todos los roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la institución',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Institución encontrada',
    type: InstitucionEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Institución no encontrada',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.institucionesService.findOne(id);
  }

  @Put(':id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar una institución',
    description: 'Actualiza datos de una IED. Accesible por ADMINISTRATIVO y ADMINISTRADOR.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la institución a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Institución actualizada',
    type: InstitucionEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstitucionDto: UpdateInstitucionDto,
  ) {
    return this.institucionesService.update(id, updateInstitucionDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una institución',
    description: 'Elimina una IED del sistema. No se puede eliminar si tiene sedes asociadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la institución a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Institución eliminada',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene registros asociados',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Institución no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.institucionesService.remove(id);
  }
}