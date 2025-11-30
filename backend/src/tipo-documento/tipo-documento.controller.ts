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
import { TipoDocumentoService } from './tipo-documento.service';
import { CreateTipoDocumentoDto, UpdateTipoDocumentoDto } from './dto';
import { TipoDocumentoEntity } from './entities/tipo-documento.entity';

@ApiTags('Tipos de Documento')
@Controller('tipo-documento')
@Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
export class TipoDocumentoController {
    constructor(private readonly tipoDocumentoService: TipoDocumentoService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear un nuevo tipo de documento',
        description: 'Crea un tipo de documento que puede ser asignado a personal o estudiantes (ej: CC, TI, CE, PA).'
    })
    @ApiResponse({
        status: 201,
        description: 'Tipo de documento creado correctamente',
        type: TipoDocumentoEntity,
        schema: {
            example: {
                id: 1,
                codigo: 'CC',
                descripcion: 'Cédula de Ciudadanía'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos o código ya existe'
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR y ADMINISTRATIVO' })
    create(@Body() createTipoDocumentoDto: CreateTipoDocumentoDto) {
        return this.tipoDocumentoService.create(createTipoDocumentoDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar todos los tipos de documento',
        description: 'Obtiene todos los tipos de documento registrados ordenados por código.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de tipos de documento obtenida correctamente',
        type: [TipoDocumentoEntity],
        schema: {
            example: [
                { id: 1, codigo: 'CC', descripcion: 'Cédula de Ciudadanía' },
                { id: 2, codigo: 'CE', descripcion: 'Cédula de Extranjería' },
                { id: 3, codigo: 'TI', descripcion: 'Tarjeta de Identidad' }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    findAll() {
        return this.tipoDocumentoService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener tipo de documento por ID',
        description: 'Obtiene la información detallada de un tipo de documento específico.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del tipo de documento',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Tipo de documento encontrado',
        type: TipoDocumentoEntity,
        schema: {
            example: {
                id: 1,
                codigo: 'CC',
                descripcion: 'Cédula de Ciudadanía'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tipoDocumentoService.findOne(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar un tipo de documento',
        description: 'Actualiza el código o descripción de un tipo de documento existente.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del tipo de documento a actualizar',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Tipo de documento actualizado correctamente',
        type: TipoDocumentoEntity,
        schema: {
            example: {
                id: 1,
                codigo: 'CC',
                descripcion: 'Cédula de Ciudadanía - Actualizado'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos o código ya existe' })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTipoDocumentoDto: UpdateTipoDocumentoDto
    ) {
        return this.tipoDocumentoService.update(id, updateTipoDocumentoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar un tipo de documento',
        description: 'Elimina un tipo de documento del sistema. No se puede eliminar si está siendo usado por personal o estudiantes. Solo ADMINISTRADOR puede realizar esta acción.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del tipo de documento a eliminar',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Tipo de documento eliminado correctamente',
        schema: {
            example: {
                message: 'Tipo de documento con id 1 eliminado correctamente'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'No se puede eliminar porque está siendo usado por personal o estudiantes'
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR' })
    @ApiResponse({ status: 404, description: 'Tipo de documento no encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tipoDocumentoService.remove(id);
    }
}
