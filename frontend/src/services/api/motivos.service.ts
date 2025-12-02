import apiClient from './api-client';
import type { Motivo } from '../../types/registroClases';

export class MotivosService {
    private readonly BASE_PATH = '/motivo';

    async getAll(): Promise<Motivo[]> {
        const response = await apiClient.get<Motivo[]>(this.BASE_PATH);
        return response.data;
    }

    async create(data: Omit<Motivo, 'id'>): Promise<Motivo> {
        const response = await apiClient.post<Motivo>(this.BASE_PATH, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const motivosService = new MotivosService();
