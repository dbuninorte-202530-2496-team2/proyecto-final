import apiClient from './api-client';

// Types matching backend
export interface Componente {
    id: number;
    nombre: string;
    tipo_programa: number; // 1: INSIDE, 2: OUTSIDE
    porcentaje: number;
    id_periodo: number;
}

export interface CreateComponenteDto {
    nombre: string;
    tipo_programa: number;
    porcentaje: number;
    id_periodo: number;
}

export interface UpdateComponenteDto {
    nombre?: string;
    tipo_programa?: number;
    porcentaje?: number;
    id_periodo?: number;
}

// Componentes Service
class ComponentesService {
    private readonly BASE_PATH = '/componentes';

    async getByPeriodo(id_periodo: number, tipo_programa?: number): Promise<Componente[]> {
        const response = await apiClient.get<Componente[]>(`${this.BASE_PATH}/periodo/${id_periodo}`, {
            params: tipo_programa ? { tipo_programa } : undefined
        });
        return response.data;
    }

    async getById(id: number): Promise<Componente> {
        const response = await apiClient.get<Componente>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: CreateComponenteDto): Promise<Componente> {
        const response = await apiClient.post<Componente>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdateComponenteDto): Promise<Componente> {
        const response = await apiClient.patch<Componente>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const componentesService = new ComponentesService();
