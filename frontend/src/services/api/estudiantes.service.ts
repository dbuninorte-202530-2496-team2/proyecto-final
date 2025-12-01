import apiClient from './api-client';

// Types matching backend DTOs
export interface Estudiante {
    id: number;
    codigo: string;
    nombre: string;
    apellidos: string;
    tipo_doc: number;
    score_in?: number | null;
    score_out?: number | null;
    aula_actual_id?: number | null;
}

export interface CreateEstudianteDto {
    codigo: string;
    nombre: string;
    apellidos: string;
    tipo_doc: number;
    score_in?: number | null;
    score_out?: number | null;
}

export interface UpdateEstudianteDto {
    codigo?: string;
    nombre?: string;
    apellidos?: string;
    tipo_doc?: number;
    score_in?: number | null;
    score_out?: number | null;
}

export interface UpdateScoreDto {
    score_in?: number | null;
    score_out?: number | null;
}

export interface AsignarAulaDto {
    id_aula: number;
    fecha_asignado?: string;
}

export interface MoverAulaDto {
    id_aula_destino: number;
    fecha_movimiento?: string;
}

// Estudiantes Service
class EstudiantesService {
    private readonly BASE_PATH = '/estudiantes';

    async getAll(): Promise<Estudiante[]> {
        const response = await apiClient.get<Estudiante[]>(this.BASE_PATH);
        return response.data;
    }

    async getById(id: number): Promise<Estudiante> {
        const response = await apiClient.get<Estudiante>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: CreateEstudianteDto): Promise<Estudiante> {
        const response = await apiClient.post<Estudiante>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdateEstudianteDto): Promise<Estudiante> {
        const response = await apiClient.patch<Estudiante>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async updateScores(id: number, data: UpdateScoreDto): Promise<Estudiante> {
        const response = await apiClient.put<Estudiante>(`${this.BASE_PATH}/${id}/scores`, data);
        return response.data;
    }

    // Métodos para gestión de aulas

    async getAulaActual(id: number): Promise<{ id_aula: number | null }> {
        const response = await apiClient.get<{ id_aula: number | null }>(`${this.BASE_PATH}/${id}/aula-actual`);
        return response.data;
    }

    async asignarAula(id: number, data: AsignarAulaDto): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(`${this.BASE_PATH}/${id}/asignar-aula`, data);
        return response.data;
    }

    async moverAula(id: number, data: MoverAulaDto): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(`${this.BASE_PATH}/${id}/mover-aula`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const estudiantesService = new EstudiantesService();
