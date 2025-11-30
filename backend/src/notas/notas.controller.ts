import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Query,
    Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotasService } from './notas.service';
import { RegistrarNotaDto, GetNotasFilterDto, UpdateNotaDto } from './dto';
import { NotaEntity } from './entities/nota.entity';

@ApiTags('Notas')
@Controller('notas')
export class NotasController {
    constructor(private readonly notasService: NotasService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar una nueva nota' })
    @ApiResponse({ status: 201, description: 'Nota registrada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o regla de negocio violada' })
    @ApiResponse({ status: 403, description: 'Tutor no autorizado' })
    @ApiResponse({ status: 404, description: 'Estudiante o componente no encontrado' })
    create(@Body() registrarNotaDto: RegistrarNotaDto) {
        return this.notasService.create(registrarNotaDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener notas con filtros dinámicos' })
    @ApiResponse({ status: 200, description: 'Lista de notas', type: [NotaEntity] })
    findAll(@Query() filter: GetNotasFilterDto) {
        return this.notasService.findAll(filter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una nota por ID' })
    @ApiResponse({ status: 200, description: 'Nota encontrada', type: NotaEntity })
    @ApiResponse({ status: 404, description: 'Nota no encontrada' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.notasService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una nota por ID' })
    @ApiResponse({ status: 200, description: 'Nota actualizada', type: NotaEntity })
    @ApiResponse({ status: 404, description: 'Nota no encontrada' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateNotaDto: UpdateNotaDto
    ) {
        return this.notasService.update(id, updateNotaDto);
    }
}
