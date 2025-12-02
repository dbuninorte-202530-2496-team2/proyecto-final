import apiClient from './api-client';
import type { Componente } from '../../types/nota';

export class ComponentesService {
    private readonly BASE_PATH = '/componente';

    async getAll(): Promise<Componente[]> {
        const response = await apiClient.get<Componente[]>(this.BASE_PATH);
        return response.data;
    }

    async create(data: Omit<Componente, 'id'>): Promise<Componente> {
        const response = await apiClient.post<Componente>(this.BASE_PATH, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const componentesService = new ComponentesService();
