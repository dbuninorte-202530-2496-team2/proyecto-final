import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { MotivoService } from './motivo.service';
import { CreateMotivoDto } from './dto/create-motivo.dto';
import { UpdateMotivoDto } from './dto/update-motivo.dto';
import { MotivoEntity } from './entities/motivo.entity';

@ApiTags('Motivos')
@Controller('motivo')
@Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
export class MotivoController {
    constructor(private readonly motivoService: MotivoService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear un nuevo motivo',
        description: 'Crea un motivo de inasistencia que puede ser usado cuando un tutor no dicta clase.'
    })
    @ApiResponse({
        status: 201,
        description: 'Motivo creado correctamente',
        type: MotivoEntity,
        schema: {
            example: {
                id: 1,
                descripcion: 'Falta por motivo de salud'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR y ADMINISTRATIVO' })
    create(@Body() createMotivoDto: CreateMotivoDto) {
        return this.motivoService.create(createMotivoDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar todos los motivos',
        description: 'Obtiene todos los motivos de inasistencia registrados en el sistema.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de motivos obtenida correctamente',
        type: [MotivoEntity],
        schema: {
            example: [
                { id: 1, descripcion: 'Falta por motivo de salud' },
                { id: 2, descripcion: 'Falta por fuerza mayor' },
                { id: 3, descripcion: 'Permiso personal' }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    findAll() {
        return this.motivoService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener motivo por ID',
        description: 'Obtiene la información detallada de un motivo específico.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del motivo',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Motivo encontrado',
        type: MotivoEntity,
        schema: {
            example: {
                id: 1,
                descripcion: 'Falta por motivo de salud'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.motivoService.findOne(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar un motivo',
        description: 'Actualiza la descripción de un motivo existente.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del motivo a actualizar',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Motivo actualizado correctamente',
        type: MotivoEntity,
        schema: {
            example: {
                id: 1,
                descripcion: 'Falta por motivo de salud - Actualizado'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMotivoDto: UpdateMotivoDto
    ) {
        return this.motivoService.update(id, updateMotivoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar un motivo',
        description: 'Elimina un motivo del sistema. No se puede eliminar si está siendo usado en asistencias. Solo ADMINISTRADOR puede realizar esta acción.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del motivo a eliminar',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Motivo eliminado correctamente',
        schema: {
            example: {
                message: 'Motivo con id 1 eliminado correctamente'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'No se puede eliminar porque está siendo usado en asistencias'
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR' })
    @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.motivoService.remove(id);
    }
}
