import apiClient from './api-client';

// Types matching backend DTOs
export interface Personal {
    id: number;
    codigo: string;
    nombre: string;
    apellido?: string;
    correo: string;
    telefono?: string;
    tipo_doc: number;
    id_rol: number;
    usuario?: string;
}

export interface CreatePersonalDto {
    codigo: string;
    nombre: string;
    apellido?: string;
    correo: string;
    telefono?: string;
    tipo_doc: number;
    id_rol: number;
    usuario?: string;
}

export interface UpdatePersonalDto {
    codigo?: string;
    nombre?: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    tipo_doc?: number;
    id_rol?: number;
    usuario?: string;
}

// Personal Service
class PersonalService {
    private readonly BASE_PATH = '/personal';

    async getAll(): Promise<Personal[]> {
        const response = await apiClient.get<Personal[]>(this.BASE_PATH);
        return response.data;
    }

    async getTutores(): Promise<Personal[]> {
        const response = await apiClient.get<Personal[]>(`${this.BASE_PATH}/tutores`);
        return response.data;
    }

    async getById(id: number): Promise<Personal> {
        const response = await apiClient.get<Personal>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: CreatePersonalDto): Promise<Personal> {
        const response = await apiClient.post<Personal>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdatePersonalDto): Promise<Personal> {
        const response = await apiClient.patch<Personal>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const personalService = new PersonalService();
