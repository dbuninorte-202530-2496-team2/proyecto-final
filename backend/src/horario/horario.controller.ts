import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { HorarioEntity } from './entities/horario.entity';

@ApiTags('Horarios')
@Controller('horario')
@Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
export class HorarioController {
    constructor(private readonly horarioService: HorarioService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear un nuevo horario',
        description: 'Crea un horario base que puede ser asignado a aulas. La duración debe ser 40, 45, 50, 55 o 60 minutos. El horario es único por combinación (día, hora_inicio, hora_fin).'
    })
    @ApiResponse({
        status: 201,
        description: 'Horario creado correctamente',
        type: HorarioEntity,
        schema: {
            example: {
                id: 1,
                dia_sem: 'LU',
                hora_ini: '08:00',
                hora_fin: '08:40'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos o horario ya existe para esa combinación día/hora'
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR y ADMINISTRATIVO' })
    create(@Body() createHorarioDto: CreateHorarioDto) {
        return this.horarioService.create(createHorarioDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar todos los horarios',
        description: 'Obtiene todos los horarios registrados ordenados por día de la semana y hora de inicio.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de horarios obtenida correctamente',
        type: [HorarioEntity],
        schema: {
            example: [
                { id: 1, dia_sem: 'LU', hora_ini: '08:00', hora_fin: '08:40' },
                { id: 2, dia_sem: 'LU', hora_ini: '10:00', hora_fin: '10:50' },
                { id: 3, dia_sem: 'MA', hora_ini: '08:00', hora_fin: '09:00' }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    findAll() {
        return this.horarioService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener horario por ID',
        description: 'Obtiene la información detallada de un horario específico.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del horario',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Horario encontrado',
        type: HorarioEntity,
        schema: {
            example: {
                id: 1,
                dia_sem: 'LU',
                hora_ini: '08:00',
                hora_fin: '08:40'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Horario no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.horarioService.findOne(id);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar un horario',
        description: 'Elimina un horario del sistema. No se puede eliminar si está siendo usado en aulas o asistencias. Solo ADMINISTRADOR puede realizar esta acción. IMPORTANTE: Los horarios son inmutables, no se pueden actualizar una vez creados.'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID del horario a eliminar',
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Horario eliminado correctamente',
        schema: {
            example: {
                message: 'Horario con id 1 eliminado correctamente'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'No se puede eliminar porque está siendo usado en aulas o asistencias'
    })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes. Solo ADMINISTRADOR' })
    @ApiResponse({ status: 404, description: 'Horario no encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.horarioService.remove(id);
    }

    // Nota: No existe endpoint PUT/PATCH porque los horarios son INMUTABLES según el schema
    // El trigger trg_horario_immutable en la base de datos bloquea cualquier UPDATE
}
