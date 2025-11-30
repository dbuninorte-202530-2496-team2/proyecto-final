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
import { FestivoService } from './festivo.service';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { UpdateFestivoDto } from './dto/update-festivo.dto';

@ApiTags('Festivos')
@Controller('festivo')
export class FestivoController {
    constructor(private readonly festivoService: FestivoService) { }

    @Post()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo festivo' })
    @ApiResponse({ status: 201, description: 'Festivo creado correctamente' })
    create(@Body() createFestivoDto: CreateFestivoDto) {
        return this.festivoService.create(createFestivoDto);
    }

    @Get()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Listar todos los festivos' })
    @ApiResponse({ status: 200, description: 'Lista de festivos obtenida' })
    findAll() {
        return this.festivoService.findAll();
    }

    @Get(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obtener festivo por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Festivo encontrado' })
    @ApiResponse({ status: 404, description: 'Festivo no encontrado' })
    findOne(@Param('id') id: number) {
        return this.festivoService.findOne(id);
    }

    @Put(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Actualizar un festivo' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Festivo actualizado correctamente' })
    update(@Param('id') id: number, @Body() updateFestivoDto: UpdateFestivoDto) {
        return this.festivoService.update(id, updateFestivoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Eliminar un festivo' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Festivo eliminado correctamente' })
    @ApiResponse({ status: 404, description: 'Festivo no encontrado' })
    remove(@Param('id') id: number) {
        return this.festivoService.remove(id);
    }
}
