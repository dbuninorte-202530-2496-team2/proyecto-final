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
import { FestivoService } from './festivo.service';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { UpdateFestivoDto } from './dto/update-festivo.dto';
import { FestivoEntity } from './entities/festivo.entity';

@ApiTags('Festivos')
@Controller('festivo')
@Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
export class FestivoController {
    constructor(private readonly festivoService: FestivoService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear un nuevo festivo',
        description: 'Registra un festivo en el calendario del programa. Los festivos se usan para validar asistencias de tutores.'
    })
    @ApiResponse({
        status: 201,
        description: 'Festivo creado correctamente',
        type: FestivoEntity,
        schema: {
            example: {
                id: 1,
                fecha: '2024-12-25',
                descripcion: 'Navidad'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR y ADMINISTRATIVO' })
    create(@Body() createFestivoDto: CreateFestivoDto) {
        return this.festivoService.create(createFestivoDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar todos los festivos',
        description: 'Obtiene todos los festivos registrados ordenados por fecha ascendente.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de festivos obtenida correctamente',
        type: [FestivoEntity],
        schema: {
            example: [
                { id: 1, fecha: '2024-01-01', descripcion: 'Año Nuevo' },
                { id: 2, fecha: '2024-12-25', descripcion: 'Navidad' }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    findAll() {
        return this.festivoService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener festivo por ID',
        description: 'Obtiene la información detallada de un festivo específico.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del festivo',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Festivo encontrado',
        type: FestivoEntity,
        schema: {
            example: {
                id: 1,
                fecha: '2024-12-25',
                descripcion: 'Navidad'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Festivo no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.festivoService.findOne(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar un festivo',
        description: 'Actualiza la fecha o descripción de un festivo existente.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del festivo a actualizar',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Festivo actualizado correctamente',
        type: FestivoEntity,
        schema: {
            example: {
                id: 1,
                fecha: '2024-12-25',
                descripcion: 'Navidad - Actualizado'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Festivo no encontrado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFestivoDto: UpdateFestivoDto
    ) {
        return this.festivoService.update(id, updateFestivoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar un festivo',
        description: 'Elimina un festivo del sistema. Solo ADMINISTRADOR puede realizar esta acción.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del festivo a eliminar',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Festivo eliminado correctamente',
        schema: {
            example: {
                message: 'Festivo con id 1 eliminado correctamente'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR' })
    @ApiResponse({ status: 404, description: 'Festivo no encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.festivoService.remove(id);
    }
}
