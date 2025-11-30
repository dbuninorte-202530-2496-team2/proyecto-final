import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
import { AulaHorarioSemanaService } from './aula-horario-semana.service';
import { AsignarHorarioAulaDto, CrearSesionEspecificaDto } from './dto';
import { AulaHorarioSemanaEntity } from './entities/aula-horario-semana.entity';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@Auth()
@ApiTags('Aula-Horario-Semana')
@Controller()
export class AulaHorarioSemanaController {
  constructor(
    private readonly aulaHorarioSemanaService: AulaHorarioSemanaService
  ) { }

  @Get('aulas/:id_aula/horarios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los horarios de un aula',
    description: 'Retorna una lista de todos los horarios asignados a un aula específica con información de las semanas.'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horarios obtenida exitosamente',
    type: [AulaHorarioSemanaEntity],
  })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  findHorariosByAula(@Param('id_aula', ParseIntPipe) id_aula: number) {
    return this.aulaHorarioSemanaService.findHorariosByAula(id_aula);
  }

  @Post('aulas/:id_aula/horarios')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Asignar un horario a un aula',
    description: 'Asigna un horario específico a un aula desde una semana determinada. Solo accesible por ADMINISTRATIVO y ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Horario asignado exitosamente',
    type: AulaHorarioSemanaEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe esta asignación',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({
    status: 404,
    description: 'Aula, horario o semana no encontrada',
  })
  asignarHorario(
    @Param('id_aula', ParseIntPipe) id_aula: number,
    @Body() asignarHorarioDto: AsignarHorarioAulaDto,
  ) {
    return this.aulaHorarioSemanaService.asignarHorario(id_aula, asignarHorarioDto);
  }

  @Post('aulas/:id_aula/horarios/sesion-especifica')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear sesión específica (reposición)',
    description: 'Crea una sesión de clase en una fecha específica (ej: para reposiciones). El sistema calcula automáticamente la semana correspondiente. Solo accesible por ADMINISTRATIVO y ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión creada exitosamente',
    schema: {
      example: {
        message: 'Sesión creada exitosamente para la fecha 2024-03-15 (semana 10)',
        asignacion: {
          id_aula: 1,
          id_horario: 5,
          id_semana: 10
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'No existe una semana que contenga la fecha o ya existe la sesión',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({
    status: 404,
    description: 'Aula u horario no encontrado',
  })
  crearSesionEspecifica(
    @Param('id_aula', ParseIntPipe) id_aula: number,
    @Body() crearSesionDto: CrearSesionEspecificaDto,
  ) {
    return this.aulaHorarioSemanaService.crearSesionEspecifica(id_aula, crearSesionDto);
  }

  @Delete('aulas/:id_aula/horarios/:id_horario/:id_semana')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar asignación de horario',
    description: 'Elimina la asignación de un horario específico a un aula en una semana. No se puede eliminar si tiene asistencias registradas. Solo accesible por ADMINISTRATIVO y ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiParam({
    name: 'id_horario',
    description: 'ID del horario',
    example: 5,
  })
  @ApiParam({
    name: 'id_semana',
    description: 'ID de la semana',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación eliminada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene asistencias registradas',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada',
  })
  eliminarAsignacion(
    @Param('id_aula', ParseIntPipe) id_aula: number,
    @Param('id_horario', ParseIntPipe) id_horario: number,
    @Param('id_semana', ParseIntPipe) id_semana: number,
  ) {
    return this.aulaHorarioSemanaService.eliminarAsignacion(
      id_aula,
      id_horario,
      id_semana
    );
  }
}