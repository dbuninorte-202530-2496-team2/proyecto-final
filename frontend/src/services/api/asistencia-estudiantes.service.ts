import apiClient from './api-client';

export interface AsistenciaMasivaDto {
    fecha_real: string;
    id_aula: number;
    id_horario: number;
    estudiantes_presentes?: number[];
}

class AsistenciaEstudiantesService {
    private readonly BASE_PATH = '/asistencia-estudiantes';

    async registrarAsistenciaMasiva(data: AsistenciaMasivaDto): Promise<any> {
        const response = await apiClient.post<any>(`${this.BASE_PATH}/masiva`, data);
        return response.data;
    }

    async getPorEstudiante(id: number): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.BASE_PATH}/estudiante/${id}`);
        return response.data;
    }

    async getPorAula(id: number): Promise<any[]> {
        const response = await apiClient.get<any[]>(`${this.BASE_PATH}/aula/${id}`);
        return response.data;
    }
}

export const asistenciaEstudiantesService = new AsistenciaEstudiantesService();
