import apiClient from './api-client';
import type { Componente } from '../../types/nota';

export interface CreateComponenteDto {
    nombre: string;
    tipo_programa: number; // 1 = INSIDECLASSROOM, 2 = OUTSIDECLASSROOM
    porcentaje: number;
    id_periodo: number;
}

export interface UpdateComponenteDto {
    nombre?: string;
    tipo_programa?: number;
    porcentaje?: number;
    id_periodo?: number;
}

export const componentesService = {
    getByPeriodo: async (id_periodo: number, tipo_programa?: number): Promise<Componente[]> => {
        const params = tipo_programa ? `?tipo_programa=${tipo_programa}` : '';
        const response = await apiClient.get<Componente[]>(`/componentes/periodo/${id_periodo}${params}`);
        return response.data;
    },

    getById: async (id: number): Promise<Componente> => {
        const response = await apiClient.get<Componente>(`/componentes/${id}`);
        return response.data;
    },

    create: async (data: CreateComponenteDto): Promise<Componente> => {
        const response = await apiClient.post<Componente>('/componentes', data);
        return response.data;
    },

    update: async (id: number, data: UpdateComponenteDto): Promise<Componente> => {
        const response = await apiClient.patch<Componente>(`/componentes/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/componentes/${id}`);
    },
};
