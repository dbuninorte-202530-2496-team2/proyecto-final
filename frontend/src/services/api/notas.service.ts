import apiClient from './api-client';
import type { Nota, RegistrarNotaPayload } from '../../types/nota';

// DTOs matching backend
export interface GetNotasFilterDto {
    id_estudiante?: number;
    id_componente?: number;
    id_aula?: number;
    id_periodo?: number;
}

export interface UpdateNotaDto {
    valor: number;
    comentario?: string;
}

// Notas Service
class NotasService {
    private readonly BASE_PATH = '/notas';

    async getAll(filter?: GetNotasFilterDto): Promise<Nota[]> {
        const response = await apiClient.get<Nota[]>(this.BASE_PATH, {
            params: filter
        });
        return response.data;
    }

    async getById(id: number): Promise<Nota> {
        const response = await apiClient.get<Nota>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: RegistrarNotaPayload): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdateNotaDto): Promise<Nota> {
        const response = await apiClient.patch<Nota>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }
}

export const notasService = new NotasService();
