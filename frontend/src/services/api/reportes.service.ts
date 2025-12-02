import apiClient from './api-client';
import type {
    AsistenciaAulaDetalle,
    AsistenciaEstudianteDetalle,
    BoletinEstudiante,
} from '../../types/reportes';

// Tipos para respuestas de reportes de tutor
export interface AsistenciaTutorReporte {
    fecha_real: string;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    aula_grado: number;
    aula_grupo: number;
    sede_nombre: string;
    institucion_nombre: string;
    dicto_clase: boolean | null;
    fecha_reposicion: string | null;
    motivo_descripcion: string | null;
    estado: string; // 'DICTADA' | 'NO_DICTADA' | 'REPUESTA' | 'PENDIENTE'
}

export interface NotasTutorReporte {
    fecha_registro: string;
    estudiante_nombre: string;
    aula_grado: number;
    aula_grupo: number;
    sede_nombre: string;
    institucion_nombre: string;
    componente_nombre: string;
    periodo_anho: number;
    periodo_numero: number;
    valor_nota: number;
    comentario: string | null;
}

export interface FiltroFechas {
    fecha_inicio?: string;
    fecha_fin?: string;
}

// Response from backend for boletin - needs transformation
interface BoletinBackendResponse {
    estudiante_nombre: string;
    estudiante_apellidos: string;
    institucion_nombre: string;
    sede_nombre: string;
    grado: number;
    grupo: number;
    programa: string;
    periodo_anho: number;
    componente_nombre: string;
    componente_porcentaje: number;
    nota_valor: number | null;
    nota_ponderada: number;
    nota_final: number;
}

// Reportes Service
class ReportesService {
    private readonly BASE_PATH = '/reportes';

    // ===== REPORTES DE AUTOGESTIÓN DE TUTOR =====

    async getAsistenciaTutor(tutorId: number, filtro?: FiltroFechas): Promise<AsistenciaTutorReporte[]> {
        const response = await apiClient.get<AsistenciaTutorReporte[]>(
            `${this.BASE_PATH}/tutor/${tutorId}/asistencia`,
            { params: filtro }
        );
        console.log(response.data)
        return response.data;
    }

    async getNotasTutor(tutorId: number): Promise<NotasTutorReporte[]> {
        const response = await apiClient.get<NotasTutorReporte[]>(
            `${this.BASE_PATH}/tutor/${tutorId}/notas`
        );
        console.log(response.data)
        return response.data;
    }

    // ===== REPORTES ACADÉMICOS =====

    /**
     * Obtiene el reporte detallado de asistencia de un aula
     */
    async getAsistenciaAula(
        aulaId: number,
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<AsistenciaAulaDetalle[]> {
        const response = await apiClient.get<AsistenciaAulaDetalle[]>(
            `${this.BASE_PATH}/asistencia/aula/${aulaId}`,
            {
                params: {
                    ...(fechaInicio && { fecha_inicio: fechaInicio }),
                    ...(fechaFin && { fecha_fin: fechaFin })
                }
            }
        );
        return response.data;
    }

    /**
     * Obtiene el reporte detallado de asistencia de un estudiante
     */
    async getAsistenciaEstudiante(
        estudianteId: number,
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<AsistenciaEstudianteDetalle[]> {
        const response = await apiClient.get<AsistenciaEstudianteDetalle[]>(
            `${this.BASE_PATH}/asistencia/estudiante/${estudianteId}`,
            {
                params: {
                    ...(fechaInicio && { fecha_inicio: fechaInicio }),
                    ...(fechaFin && { fecha_fin: fechaFin })
                }
            }
        );
        return response.data;
    }

    /**
     * Obtiene el boletín de calificaciones de un estudiante
     * Retorna un array con una fila por cada periodo
     */
    async getBoletinEstudiante(id_estudiante: number): Promise<BoletinEstudiante[]> {
        const response = await apiClient.get<BoletinEstudiante[]>(
            `${this.BASE_PATH}/boletin`,
            { params: { id_estudiante } }
        );
        return response.data;
    }


    // ===== PDF DOWNLOAD METHODS =====

    // PDF Download methods
    async getAsistenciaTutorPDF(tutorId: number, filtro?: FiltroFechas): Promise<Blob> {
        const response = await apiClient.get(
            `${this.BASE_PATH}/tutor/${tutorId}/asistencia`,
            {
                params: filtro,
                headers: { 'Accept': 'application/pdf' },
                responseType: 'blob'
            }
        );
        return response.data;
    }

    async getNotasTutorPDF(tutorId: number): Promise<Blob> {
        const response = await apiClient.get(
            `${this.BASE_PATH}/tutor/${tutorId}/notas`,
            {
                headers: { 'Accept': 'application/pdf' },
                responseType: 'blob'
            }
        );
        return response.data;
    }
}

export const reportesService = new ReportesService();

