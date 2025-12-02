import apiClient from './api-client';

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

// Reportes Service
class ReportesService {
    private readonly BASE_PATH = '/reportes';

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
