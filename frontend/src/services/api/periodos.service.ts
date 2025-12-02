import apiClient from './api-client';
import type { Periodo } from '../../types/periodo';
import type { Semana } from '../../types/semana';

export interface CreatePeriodoDto {
    anho: number;
    numero: number;
}

export interface UpdatePeriodoDto {
    anho?: number;
    numero?: number;
}

export interface GenerarSemanasDto {
    fec_ini: string;
    cantidad_semanas: number;
}

export interface CalendarioInfo {
    total_semanas: number;
    primera_semana_inicio: string;
    primera_semana_fin: string;
    ultima_semana_inicio: string;
    ultima_semana_fin: string;
    duracion_dias: number;
}

export const periodosService = {
    getAll: async (): Promise<Periodo[]> => {
        const response = await apiClient.get<Periodo[]>('/periodos');
        return response.data;
    },

    getById: async (id: number): Promise<Periodo> => {
        const response = await apiClient.get<Periodo>(`/periodos/${id}`);
        return response.data;
    },

    create: async (data: CreatePeriodoDto): Promise<Periodo> => {
        const response = await apiClient.post<Periodo>('/periodos', data);
        return response.data;
    },

    update: async (id: number, data: UpdatePeriodoDto): Promise<Periodo> => {
        const response = await apiClient.put<Periodo>(`/periodos/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/periodos/${id}`);
    },

    getSemanasByPeriodo: async (id: number): Promise<Semana[]> => {
        const response = await apiClient.get<Semana[]>(`/periodos/${id}/semanas`);
        return response.data;
    },

    deleteSemanasByPeriodo: async (id: number): Promise<void> => {
        await apiClient.delete(`/periodos/${id}/semanas`);
    },

    generarSemanas: async (id: number, data: GenerarSemanasDto): Promise<{ message: string; semanas_creadas: number }> => {
        const response = await apiClient.post<{ message: string; semanas_creadas: number }>(`/periodos/${id}/generar-semanas`, data);
        return response.data;
    },

    getCalendarioInfo: async (id: number): Promise<CalendarioInfo> => {
        const response = await apiClient.get<CalendarioInfo>(`/periodos/${id}/calendario/info`);
        return response.data;
    },
};
