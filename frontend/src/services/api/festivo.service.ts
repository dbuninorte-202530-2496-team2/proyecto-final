import apiClient from './api-client';

export interface Festivo {
    id: number;
    fecha: string;
    descripcion?: string;
}

export interface CreateFestivoDto {
    fecha: string;
    descripcion?: string;
}

export interface UpdateFestivoDto {
    fecha?: string;
    descripcion?: string;
}

const BASE_URL = '/festivo';

export const festivoService = {
    async getAll(): Promise<Festivo[]> {
        const response = await apiClient.get<Festivo[]>(BASE_URL);
        return response.data;
    },

    async getOne(id: number): Promise<Festivo> {
        const response = await apiClient.get<Festivo>(`${BASE_URL}/${id}`);
        return response.data;
    },

    async create(data: CreateFestivoDto): Promise<Festivo> {
        const response = await apiClient.post<Festivo>(BASE_URL, data);
        return response.data;
    },

    async update(id: number, data: UpdateFestivoDto): Promise<Festivo> {
        const response = await apiClient.patch<Festivo>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    }
};
