import apiClient from './api-client';

// Types matching backend
export interface TutorAula {
    id_tutor: number;
    id_aula: number;
    consec: number;
    fecha_asignado: string;
    fecha_desasignado: string | null;
    // Extended fields from joins
    nombre_tutor?: string;
    correo_tutor?: string;
}

export interface AsignarTutorDto {
    id_tutor: number;
    fecha_asignado?: string;
}

export interface DesasignarTutorDto {
    fecha_desasignado: string;
}

export interface CambiarTutorDto {
    id_nuevo_tutor: number;
    fecha_cambio?: string;
}

// TutorAula Service
class TutorAulaService {
    private readonly BASE_PATH = '/aulas';

    async getTutoresActuales(id_aula: number): Promise<TutorAula[]> {
        const response = await apiClient.get<TutorAula[]>(`${this.BASE_PATH}/${id_aula}/tutores-actuales`);
        return response.data;
    }

    async getTutoresHistorico(id_aula: number): Promise<TutorAula[]> {
        const response = await apiClient.get<TutorAula[]>(`${this.BASE_PATH}/${id_aula}/tutores-historico`);
        return response.data;
    }

    async getHistoricoPorTutor(id_tutor: number): Promise<TutorAula[]> {
        const response = await apiClient.get<TutorAula[]>(`${this.BASE_PATH}/tutor/${id_tutor}/historico`);
        return response.data;
    }

    async asignarTutor(id_aula: number, data: AsignarTutorDto): Promise<TutorAula> {
        const response = await apiClient.post<TutorAula>(`${this.BASE_PATH}/${id_aula}/tutores`, data);
        return response.data;
    }

    async desasignarTutor(id_aula: number, id_tutor: number, data: DesasignarTutorDto): Promise<TutorAula> {
        const response = await apiClient.put<TutorAula>(
            `${this.BASE_PATH}/${id_aula}/tutores/${id_tutor}/desasignar`,
            data
        );
        return response.data;
    }

    async cambiarTutor(id_aula: number, data: CambiarTutorDto): Promise<TutorAula> {
        const response = await apiClient.put<TutorAula>(`${this.BASE_PATH}/${id_aula}/cambiar-tutor`, data);
        return response.data;
    }
}

export const tutorAulaService = new TutorAulaService();
