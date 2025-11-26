import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { EstudianteEntity } from './entities/estudiante.entity';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Estudiantes')
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Get()
  @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO, ValidRoles.TUTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar estudiantes' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes', type: [EstudianteEntity] })
  findAll() {
    return this.estudiantesService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.ADMINISTRADOR, ValidRoles.ADMINISTRATIVO, ValidRoles.TUTOR)
  @ApiParam({ name: 'id', example: 15 })
  @ApiResponse({ status: 200, description: 'Estudiante encontrado', type: EstudianteEntity })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estudiantesService.findOne(id);
  }

  @Post()
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear estudiante' })
  @ApiResponse({ status: 201, description: 'Estudiante creado', type: EstudianteEntity })
  create(@Body() dto: CreateEstudianteDto) {
    return this.estudiantesService.create(dto);
  }

  @Put(':id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante actualizado', type: EstudianteEntity })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstudianteDto) {
    return this.estudiantesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar (desactivar) estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante desactivado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estudiantesService.remove(id);
  }

  @Put(':id/scores')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar scores de estudiante' })
  @ApiResponse({ status: 200, description: 'Scores actualizados', type: EstudianteEntity })
  updateScores(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScoreDto) {
    return this.estudiantesService.updateScores(id, dto);
  }
}
