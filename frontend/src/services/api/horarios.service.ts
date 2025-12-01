import apiClient from './api-client';

export type DiaSemana = 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SA';

// Types matching backend DTOs
export interface Horario {
    id: number;
    dia_sem: DiaSemana;
    hora_ini: string;
    hora_fin: string;
}

export interface CreateHorarioDto {
    dia_sem: DiaSemana;
    hora_ini: string;
    hora_fin: string;
}

// Horarios Service
class HorariosService {
    private readonly BASE_PATH = '/horario';

    async getAll(): Promise<Horario[]> {
        const response = await apiClient.get<Horario[]>(this.BASE_PATH);
        return response.data;
    }

    async getById(id: number): Promise<Horario> {
        const response = await apiClient.get<Horario>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: CreateHorarioDto): Promise<Horario> {
        const response = await apiClient.post<Horario>(this.BASE_PATH, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const horariosService = new HorariosService();
