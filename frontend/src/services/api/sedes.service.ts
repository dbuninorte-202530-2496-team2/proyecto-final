import apiClient from './api-client';

// Types matching backend DTOs
export interface Sede {
    id: number;
    nombre: string;
    direccion: string;
    id_inst: number;
    is_principal: boolean;
}

export interface CreateSedeDto {
    nombre: string;
    direccion?: string;
    id_inst: number;
    is_principal: boolean;
}

export interface UpdateSedeDto {
    nombre?: string;
    direccion?: string;
    id_inst?: number;
    is_principal?: boolean;
}

// Sedes Service
class SedesService {
    private readonly BASE_PATH = '/sedes';

    async getAll(): Promise<Sede[]> {
        const response = await apiClient.get<Sede[]>(this.BASE_PATH);
        return response.data;
    }

    async getById(id: number): Promise<Sede> {
        const response = await apiClient.get<Sede>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async getByInstitucion(id_inst: number): Promise<Sede[]> {
        const response = await apiClient.get<Sede[]>(`/instituciones/${id_inst}/sedes`);
        return response.data;
    }

    async create(data: CreateSedeDto): Promise<Sede> {
        const response = await apiClient.post<Sede>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdateSedeDto): Promise<Sede> {
        const response = await apiClient.put<Sede>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const sedesService = new SedesService();
