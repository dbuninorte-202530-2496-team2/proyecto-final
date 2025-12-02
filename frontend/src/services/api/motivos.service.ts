import apiClient from './api-client';

export interface Motivo {
    id: number;
    descripcion: string;
}

export interface CreateMotivoDto {
    descripcion: string;
}

class MotivosService {
    private readonly BASE_PATH = '/motivo';

    async getAll(): Promise<Motivo[]> {
        const response = await apiClient.get<Motivo[]>(this.BASE_PATH);
        return response.data;
    }

    async create(data: CreateMotivoDto): Promise<Motivo> {
        const response = await apiClient.post<Motivo>(this.BASE_PATH, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const motivosService = new MotivosService();
