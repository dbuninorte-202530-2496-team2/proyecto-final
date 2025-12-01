import apiClient from './api-client';

// Types matching backend DTOs
export interface Rol {
    id: number;
    nombre: string;
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
}

export const rolesService = new RolesService();
