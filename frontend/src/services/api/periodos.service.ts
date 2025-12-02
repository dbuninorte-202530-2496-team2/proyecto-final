import apiClient from './api-client';
import type { Periodo } from '../../types/periodo';

// DTOs matching backend
export interface CreatePeriodoDto {
    anho: number;
    numero: number;
}

export interface UpdatePeriodoDto {
    anho?: number;
    numero?: number;
}

// Periodos Service
class PeriodosService {
    private readonly BASE_PATH = '/periodos';

    async getAll(): Promise<Periodo[]> {
        const response = await apiClient.get<Periodo[]>(this.BASE_PATH);
        return response.data;
    }

    async getById(id: number): Promise<Periodo> {
        const response = await apiClient.get<Periodo>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: CreatePeriodoDto): Promise<Periodo> {
        const response = await apiClient.post<Periodo>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdatePeriodoDto): Promise<Periodo> {
        const response = await apiClient.patch<Periodo>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const periodosService = new PeriodosService();
