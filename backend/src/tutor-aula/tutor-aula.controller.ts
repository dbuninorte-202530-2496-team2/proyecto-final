import {
  Controller,
  Get,
  Post,
  Put,
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
import { TutorAulaService } from './tutor-aula.service';
import { AsignarTutorDto, DesasignarTutorDto } from './dto';
import { TutorAulaEntity } from './entities/tutor-aula.entity';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@Auth()
@ApiTags('Tutor-Aula')
@Controller('aulas')
export class TutorAulaController {
  constructor(private readonly tutorAulaService: TutorAulaService) { }

  @Get(':id_aula/tutores-actuales')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener tutores actuales de un aula',
    description: 'Retorna una lista de los tutores actualmente asignados al aula (sin fecha de desasignación).'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tutores actuales obtenida exitosamente',
    type: [TutorAulaEntity],
  })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  findTutoresActuales(@Param('id_aula', ParseIntPipe) id_aula: number) {
    return this.tutorAulaService.findTutoresActuales(id_aula);
  }

  @Get(':id_aula/tutores-historico')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener histórico de tutores de un aula',
    description: 'Retorna el historial completo de todos los tutores que han estado asignados al aula.'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de tutores obtenido exitosamente',
    type: [TutorAulaEntity],
  })
  @ApiResponse({ status: 404, description: 'Aula no encontrada' })
  findTutoresHistorico(@Param('id_aula', ParseIntPipe) id_aula: number) {
    return this.tutorAulaService.findTutoresHistorico(id_aula);
  }

  @Post(':id_aula/tutores')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Asignar un tutor a un aula',
    description: 'Asigna un tutor específico a un aula. El aula no debe tener otro tutor activo. Solo accesible por ADMINISTRATIVO y ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Tutor asignado exitosamente',
    type: TutorAulaEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'El aula ya tiene un tutor activo o el personal no es tutor',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({
    status: 404,
    description: 'Aula o tutor no encontrado',
  })
  asignarTutor(
    @Param('id_aula', ParseIntPipe) id_aula: number,
    @Body() asignarTutorDto: AsignarTutorDto,
  ) {
    return this.tutorAulaService.asignarTutor(id_aula, asignarTutorDto);
  }

  @Put(':id_aula/tutores/:id_tutor/desasignar')
  @Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desasignar un tutor de un aula',
    description: 'Registra la fecha de desasignación del tutor activo en el aula. Solo accesible por ADMINISTRATIVO y ADMINISTRADOR.'
  })
  @ApiParam({
    name: 'id_aula',
    description: 'ID del aula',
    example: 1,
  })
  @ApiParam({
    name: 'id_tutor',
    description: 'ID del tutor',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Tutor desasignado exitosamente',
    type: TutorAulaEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Fecha de desasignación inválida',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró una asignación activa',
  })
  desasignarTutor(
    @Param('id_aula', ParseIntPipe) id_aula: number,
    @Param('id_tutor', ParseIntPipe) id_tutor: number,
    @Body() desasignarTutorDto: DesasignarTutorDto,
  ) {
    return this.tutorAulaService.desasignarTutor(id_aula, id_tutor, desasignarTutorDto);
  }
}