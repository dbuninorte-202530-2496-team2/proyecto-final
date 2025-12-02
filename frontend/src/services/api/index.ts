// Export all servicexport { apiClient } from './api-client';
export { sedesService } from './sedes.service';
export type { Sede, CreateSedeDto, UpdateSedeDto } from './sedes.service';
export { institucionesService } from './instituciones.service';
export type { Institucion, CreateInstitucionDto, UpdateInstitucionDto } from './instituciones.service';
export { aulasService } from './aulas.service';
export type { Aula, CreateAulaDto, UpdateAulaDto } from './aulas.service';
export { personalService } from './personal.service';
export type { Personal, CreatePersonalDto, UpdatePersonalDto } from './personal.service';
export { estudiantesService } from './estudiantes.service';
export type { Estudiante, CreateEstudianteDto, UpdateEstudianteDto, UpdateScoreDto } from './estudiantes.service';
export { horariosService } from './horarios.service';
export type { Horario, CreateHorarioDto, DiaSemana } from './horarios.service';
export { rolesService } from './roles.service';
export type { Rol } from './roles.service';
export { tipoDocumentoService } from './tipo-documento.service';
export type { TipoDocumento, CreateTipoDocumentoDto } from './tipo-documento.service';
export { festivosService } from './festivos.service';
export type { Festivo, CreateFestivoDto } from './festivos.service';
export { motivosService } from './motivos.service';
export type { Motivo, CreateMotivoDto } from './motivos.service';
export { componentesService } from './componentes.service';
export type { CreateComponenteDto, UpdateComponenteDto } from './componentes.service';
export { periodosService } from './periodos.service';
export type { CreatePeriodoDto, UpdatePeriodoDto, GenerarSemanasDto } from './periodos.service';

// Export API client for direct use if needed
export { default as apiClient } from './api-client';
