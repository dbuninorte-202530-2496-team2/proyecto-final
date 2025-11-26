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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';

@ApiTags('Horario')
@Controller('horario')
export class HorarioController {
    constructor(private readonly horarioService: HorarioService) { }

    @Post()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un horario' })
    @ApiResponse({ status: 201, description: 'Horario creado correctamente' })
    create(@Body() createHorarioDto: CreateHorarioDto) {
        return this.horarioService.create(createHorarioDto);
    }

    @Get()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Listar todos los horarios' })
    @ApiResponse({ status: 200, description: 'Lista de horarios obtenida' })
    findAll() {
        return this.horarioService.findAll();
    }

    @Get(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obtener un horario por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Horario encontrado' })
    @ApiResponse({ status: 404, description: 'Horario no encontrado' })
    findOne(@Param('id') id: number) {
        return this.horarioService.findOne(id);
    }

    @Put(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Actualizar un horario' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Horario actualizado' })
    update(@Param('id') id: number, @Body() updateHorarioDto: UpdateHorarioDto) {
        return this.horarioService.update(id, updateHorarioDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Eliminar un horario' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Horario eliminado correctamente' })
    @ApiResponse({ status: 404, description: 'Horario no encontrado' })
    remove(@Param('id') id: number) {
        return this.horarioService.remove(id);
    }
}
