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
export type { TipoDocumento } from './tipo-documento.service';
export { asistenciaTutorService } from './asistencia-tutor.service';
export type {
    ClaseProgramada,
    CreateAsistenciaTutorDto,
    UpdateAsistenciaTutorDto,
    AsistenciaTutorResponse
} from './asistencia-tutor.service';
export { motivoService } from './motivo.service';
export type { Motivo, CreateMotivoDto, UpdateMotivoDto } from './motivo.service';
export { festivoService } from './festivo.service';
export type { Festivo, CreateFestivoDto, UpdateFestivoDto } from './festivo.service';

// Export API client for direct use if needed
export { default as apiClient } from './api-client';
