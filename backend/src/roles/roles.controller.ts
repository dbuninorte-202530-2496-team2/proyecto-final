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
import { RolesService } from './roles.service';
import { CreateRolDto, UpdateRolDto } from './dto';
import { RolEntity } from './entities/rol.entity';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo rol',
    description: 'Crea un nuevo rol en el sistema. Solo accesible por ADMINISTRADOR.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Rol creado exitosamente',
    type: RolEntity,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos o rol ya existe',
    schema: {
      example: {
        statusCode: 400,
        message: 'Ya existe un rol con ese nombre',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener todos los roles',
    description: 'Retorna una lista de todos los roles disponibles en el sistema. Endpoint público.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de roles obtenida exitosamente',
    type: [RolEntity],
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener un rol por ID',
    description: 'Retorna la información de un rol específico. Endpoint público.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol',
    example: 1,
    type: Number,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol encontrado',
    type: RolEntity,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Rol no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Rol con id 5 no encontrado',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Actualizar un rol',
    description: 'Actualiza parcial o totalmente un rol existente. Solo accesible por ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol a actualizar',
    example: 1,
    type: Number,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol actualizado exitosamente',
    type: RolEntity,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ 
    status: 404, 
    description: 'Rol no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Rol con id 5 no encontrado',
        error: 'Not Found'
      }
    }
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolesService.update(id, updateRolDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar un rol',
    description: 'Elimina un rol del sistema. Solo accesible por ADMINISTRADOR. No se puede eliminar si está en uso.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del rol a eliminar',
    example: 1,
    type: Number,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol eliminado exitosamente',
    schema: {
      example: {
        message: 'Rol con id 1 eliminado correctamente'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede eliminar el rol porque está siendo usado',
    schema: {
      example: {
        statusCode: 400,
        message: 'No se puede eliminar el rol porque está siendo usado',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ 
    status: 404, 
    description: 'Rol no encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}