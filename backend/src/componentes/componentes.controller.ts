import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ComponentesService } from './componentes.service';
import { CreateComponenteDto, UpdateComponenteDto } from './dto';
import { ComponenteEntity } from './entities/componente.entity';

@ApiTags('Componentes')
@Controller('componentes')
export class ComponentesController {
    constructor(private readonly componentesService: ComponentesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo componente de evaluación' })
    @ApiResponse({ status: 201, description: 'Componente creado exitosamente', type: ComponenteEntity })
    @ApiResponse({ status: 400, description: 'Datos inválidos o suma de porcentajes excede 100%' })
    create(@Body() createComponenteDto: CreateComponenteDto) {
        return this.componentesService.create(createComponenteDto);
    }

    @Get('periodo/:id_periodo')
    @ApiOperation({ summary: 'Listar componentes por periodo' })
    @ApiQuery({ name: 'tipo_programa', required: false, description: 'Filtrar por tipo de programa (1: INSIDE, 2: OUTSIDE)' })
    @ApiResponse({ status: 200, description: 'Lista de componentes', type: [ComponenteEntity] })
    findAllByPeriodo(
        @Param('id_periodo', ParseIntPipe) id_periodo: number,
        @Query('tipo_programa') tipo_programa?: string
    ) {
        return this.componentesService.findAllByPeriodo(
            id_periodo,
            tipo_programa ? parseInt(tipo_programa) : undefined
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un componente por ID' })
    @ApiResponse({ status: 200, description: 'Componente encontrado', type: ComponenteEntity })
    @ApiResponse({ status: 404, description: 'Componente no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.componentesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un componente' })
    @ApiResponse({ status: 200, description: 'Componente actualizado', type: ComponenteEntity })
    @ApiResponse({ status: 400, description: 'Datos inválidos o suma de porcentajes excede 100%' })
    @ApiResponse({ status: 404, description: 'Componente no encontrado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateComponenteDto: UpdateComponenteDto
    ) {
        return this.componentesService.update(id, updateComponenteDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un componente' })
    @ApiResponse({ status: 200, description: 'Componente eliminado correctamente' })
    @ApiResponse({ status: 400, description: 'No se puede eliminar porque tiene notas asociadas' })
    @ApiResponse({ status: 404, description: 'Componente no encontrado' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.componentesService.remove(id);
    }
}
