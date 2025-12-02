import apiClient from './api-client';

export interface Motivo {
    id: number;
    descripcion: string;
}

export interface CreateMotivoDto {
    descripcion: string;
}

export interface UpdateMotivoDto {
    descripcion?: string;
}

const BASE_URL = '/motivo';

export const motivoService = {
    /**
     * Obtener todos los motivos
     */
    async getAll(): Promise<Motivo[]> {
        const response = await apiClient.get<Motivo[]>(BASE_URL);
        return response.data;
    },

    /**
     * Obtener un motivo por ID
     */
    async getOne(id: number): Promise<Motivo> {
        const response = await apiClient.get<Motivo>(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Crear un nuevo motivo
     */
    async create(data: CreateMotivoDto): Promise<Motivo> {
        const response = await apiClient.post<Motivo>(BASE_URL, data);
        return response.data;
    },

    /**
     * Actualizar un motivo existente
     */
    async update(id: number, data: UpdateMotivoDto): Promise<Motivo> {
        const response = await apiClient.put<Motivo>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar un motivo
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    }
};
