import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
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

import { PersonalService } from './personal.service';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Personal')
@Controller('personal')
export class PersonalController {
    constructor(private readonly personalService: PersonalService) { }

    @Post()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear personal' })
    @ApiResponse({ status: 201, description: 'Personal creado correctamente' })
    create(@Body() dto: CreatePersonalDto) {
        return this.personalService.create(dto);
    }

    @Get()
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Listar todo el personal' })
    @ApiResponse({ status: 200, description: 'Lista de personal obtenida' })
    findAll() {
        return this.personalService.findAll();
    }

    @Get('tutores')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Listar solo tutores' })
    @ApiResponse({ status: 200, description: 'Lista de tutores obtenida' })
    findTutores() {
        return this.personalService.findTutores();
    }

    @Get(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Obtener personal por ID' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del personal' })
    @ApiResponse({ status: 200, description: 'Personal encontrado' })
    @ApiResponse({ status: 404, description: 'Personal no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.personalService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Actualizar personal por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Personal actualizado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePersonalDto,
    ) {
        return this.personalService.update(id, dto);
    }

    @Delete(':id')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Eliminar personal por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Personal eliminado' })
    @ApiResponse({ status: 404, description: 'No encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.personalService.remove(id);
    }
}
