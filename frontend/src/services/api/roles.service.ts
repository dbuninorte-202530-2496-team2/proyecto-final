import apiClient from './api-client';

// Types matching backend DTOs
export interface Rol {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface RolCreateDto {
    nombre: string;
    descripcion?: string;
}

export interface RolUpdateDto {
    nombre?: string;
    descripcion?: string;
}

// Roles Service
class RolesService {
    private readonly BASE_PATH = '/roles';

    async getAll(): Promise<Rol[]> {
        const response = await apiClient.get<Rol[]>(this.BASE_PATH);
        return response.data;
    }

    async getById(id: number): Promise<Rol> {
        const response = await apiClient.get<Rol>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: Partial<Rol>): Promise<Rol> {
        const response = await apiClient.post<Rol>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: Partial<Rol>): Promise<Rol> {
        const response = await apiClient.put<Rol>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const rolesService = new RolesService();