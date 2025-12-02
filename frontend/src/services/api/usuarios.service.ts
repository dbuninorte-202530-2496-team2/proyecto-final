import apiClient from './api-client';

// Types matching backend structure
export interface UsuarioBackend {
    usuario: string;
    contrasena: string;
}

export interface CreateUsuarioDto {
    usuario: string;
    contrasena: string;
}

export interface UpdateUsuarioDto {
    contrasena?: string;
}

// Usuarios Service
class UsuariosService {
    private readonly BASE_PATH = '/usuarios';

    async getAll(): Promise<UsuarioBackend[]> {
        const response = await apiClient.get<UsuarioBackend[]>(this.BASE_PATH);
        return response.data;
    }

    async getByUsername(usuario: string): Promise<UsuarioBackend> {
        const response = await apiClient.get<UsuarioBackend>(`${this.BASE_PATH}/${usuario}`);
        return response.data;
    }

    async create(data: CreateUsuarioDto): Promise<UsuarioBackend> {
        const response = await apiClient.post<UsuarioBackend>(this.BASE_PATH, data);
        return response.data;
    }

    async update(usuario: string, data: UpdateUsuarioDto): Promise<UsuarioBackend> {
        const response = await apiClient.put<UsuarioBackend>(`${this.BASE_PATH}/${usuario}`, data);
        return response.data;
    }

    async delete(usuario: string): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${usuario}`);
    }

    async sendPassword(usuario: string): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(`${this.BASE_PATH}/${usuario}/send-password`);
        return response.data;
    }
}

export const usuariosService = new UsuariosService();
