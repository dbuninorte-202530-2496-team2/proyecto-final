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
import { MotivoService } from './motivo.service';
import { CreateMotivoDto } from './dto/create-motivo.dto';
import { UpdateMotivoDto } from './dto/update-motivo.dto';

@ApiTags('Motivos')
@Controller('motivo')
export class MotivoController {
    constructor(private readonly motivoService: MotivoService) { }

    @Post()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo motivo' })
    @ApiResponse({ status: 201, description: 'Motivo creado correctamente' })
    create(@Body() createMotivoDto: CreateMotivoDto) {
        return this.motivoService.create(createMotivoDto);
    }

    @Get()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Listar todos los motivos' })
    @ApiResponse({ status: 200, description: 'Lista de motivos obtenida' })
    findAll() {
        return this.motivoService.findAll();
    }

    @Get(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obtener motivo por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Motivo encontrado' })
    @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
    findOne(@Param('id') id: number) {
        return this.motivoService.findOne(id);
    }

    @Put(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Actualizar un motivo' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Motivo actualizado correctamente' })
    update(@Param('id') id: number, @Body() updateMotivoDto: UpdateMotivoDto) {
        return this.motivoService.update(id, updateMotivoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Eliminar un motivo' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Motivo eliminado correctamente' })
    @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
    remove(@Param('id') id: number) {
        return this.motivoService.remove(id);
    }
}
