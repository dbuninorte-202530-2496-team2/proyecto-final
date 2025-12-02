import apiClient from './api-client';

// Types matching backend DTOs
export interface Aula {
    id: number;
    grado: 4 | 5 | 9 | 10;
    grupo: number;
    id_sede: number;
    tipo_programa?: number; // Calculated by backend (1: INSIDE, 2: OUTSIDE)
    // Display fields from joins
    sedeNombre?: string;
    institucionNombre?: string;
}

export interface CreateAulaDto {
    grado: 4 | 5 | 9 | 10;
    grupo: number;
    id_sede: number;
}

export interface UpdateAulaDto {
    grado?: 4 | 5 | 9 | 10;
    grupo?: number;
    id_sede?: number;
}

export interface CambiarTutorDto {
    id_tutor_nuevo: number;
    fecha_cambio?: string;
}

// Aulas Service
class AulasService {
    private readonly BASE_PATH = '/aulas';

    async getAll(): Promise<Aula[]> {
        const response = await apiClient.get<Aula[]>(this.BASE_PATH);
        return response.data;
    }

    async getById(id: number): Promise<Aula> {
        const response = await apiClient.get<Aula>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async getBySede(id_sede: number): Promise<Aula[]> {
        const response = await apiClient.get<Aula[]>(`/sedes/${id_sede}/aulas`);
        return response.data;
    }

    async getEstudiantes(id: number): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.BASE_PATH}/${id}/estudiantes`);
        return response.data;
    }

    async getTutoresHistorico(id: number): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.BASE_PATH}/${id}/tutores-historico`);
        return response.data;
    }

    async getHistoricoPorTutor(id_tutor: number): Promise<any[]> {
        const response = await apiClient.get<any[]>(`/aulas/tutor/${id_tutor}/historico`);
        return response.data;
    }

    async asignarTutor(id_aula: number, id_tutor: number, fecha_asignado: string): Promise<any> {
        const response = await apiClient.post<any>(`${this.BASE_PATH}/${id_aula}/tutores`, { id_tutor, fecha_asignado });
        return response.data;
    }

    async desasignarTutor(id_aula: number, id_tutor: number, fecha_desasignado: string): Promise<any> {
        const response = await apiClient.put<any>(`${this.BASE_PATH}/${id_aula}/tutores/${id_tutor}/desasignar`, { fecha_desasignado });
        return response.data;
    }

    async cambiarTutor(id_aula: number, data: CambiarTutorDto): Promise<any> {
        const response = await apiClient.put<any>(`${this.BASE_PATH}/${id_aula}/cambiar-tutor`, data);
        return response.data;
    }

    async create(data: CreateAulaDto): Promise<Aula> {
        const response = await apiClient.post<Aula>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdateAulaDto): Promise<Aula> {
        const response = await apiClient.put<Aula>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const aulasService = new AulasService();
