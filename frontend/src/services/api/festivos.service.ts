import apiClient from './api-client';

export interface Festivo {
    id: number;
    fecha: string;
    descripcion: string;
}

export interface CreateFestivoDto {
    fecha: string;
    descripcion: string;
}

class FestivosService {
    private readonly BASE_PATH = '/festivo';

    async getAll(): Promise<Festivo[]> {
        const response = await apiClient.get<Festivo[]>(this.BASE_PATH);
        return response.data;
    }

    async create(data: CreateFestivoDto): Promise<Festivo> {
        const response = await apiClient.post<Festivo>(this.BASE_PATH, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const festivosService = new FestivosService();
