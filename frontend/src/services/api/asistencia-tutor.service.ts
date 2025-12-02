import apiClient from './api-client';

export interface ClaseProgramada {
    fecha_programada: string;
    id_aula: number;
    aula_info: string;
    sede_nombre: string;
    institucion_nombre: string;
    id_horario: number;
    horario_info: string;
    id_semana: number;
    tiene_asistencia: boolean;
    id_asistencia?: number | null;
    dicto_clase?: boolean | null;
    id_motivo?: number | null;
    descripcion_motivo?: string | null;
    fecha_reposicion?: string | null;
}

export interface CreateAsistenciaTutorDto {
    fecha_real: string;
    dictoClase: boolean;
    id_tutor: number;
    id_aula: number;
    id_horario: number;
    id_motivo?: number;
    fecha_reposicion?: string;
}

export interface UpdateAsistenciaTutorDto {
    fecha_real?: string;
    dictoClase?: boolean;
    id_tutor?: number;
    id_aula?: number;
    id_horario?: number;
    id_motivo?: number;
    fecha_reposicion?: string;
}

export interface AsistenciaTutorResponse {
    id: number;
    fecha_real: string;
    dictoClase: boolean;
    fecha_reposicion?: string;
    id_tutor: number;
    id_aula: number;
    id_horario: number;
    id_semana: number;
    id_motivo?: number;
    nombre_tutor?: string;
    descripcion_motivo?: string;
    dia_sem?: string;
    hora_ini?: string;
    hora_fin?: string;
}

const BASE_URL = '/asistencia-tutores';

export const asistenciaTutorService = {
    /**
     * Obtener clases programadas para un tutor en un rango de fechas
     */
    async getClasesProgramadas(
        id_tutor: number,
        fecha_inicio: string,
        fecha_fin: string
    ): Promise<ClaseProgramada[]> {
        const response = await apiClient.get<ClaseProgramada[]>(
            `${BASE_URL}/tutores/${id_tutor}/clases-programadas`,
            {
                params: {
                    fecha_inicio,
                    fecha_fin
                }
            }
        );
        return response.data;
    },

    /**
     * Crear un nuevo registro de asistencia
     */
    async create(data: CreateAsistenciaTutorDto): Promise<AsistenciaTutorResponse> {
        const response = await apiClient.post<AsistenciaTutorResponse>(BASE_URL, data);
        return response.data;
    },

    /**
     * Actualizar un registro de asistencia existente
     */
    async update(id: number, data: UpdateAsistenciaTutorDto): Promise<AsistenciaTutorResponse> {
        const response = await apiClient.put<AsistenciaTutorResponse>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Obtener todas las asistencias (solo admin)
     */
    async getAll(): Promise<AsistenciaTutorResponse[]> {
        const response = await apiClient.get<AsistenciaTutorResponse[]>(BASE_URL);
        return response.data;
    },

    /**
     * Obtener una asistencia específica por ID
     */
    async getOne(id: number): Promise<AsistenciaTutorResponse> {
        const response = await apiClient.get<AsistenciaTutorResponse>(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Obtener asistencias de un tutor con filtros opcionales de fecha
     */
    async getAsistenciasByTutor(
        id_tutor: number,
        fecha_inicio?: string,
        fecha_fin?: string
    ): Promise<AsistenciaTutorResponse[]> {
        const response = await apiClient.get<AsistenciaTutorResponse[]>(
            `${BASE_URL}/tutores/${id_tutor}/asistencia`,
            {
                params: {
                    ...(fecha_inicio && { fecha_inicio }),
                    ...(fecha_fin && { fecha_fin })
                }
            }
        );
        return response.data;
    },

    /**
     * Obtener la fecha de la semana más temprana para un tutor
     */
    async getEarliestWeekDate(id_tutor: number): Promise<string | null> {
        const response = await apiClient.get<{ earliest_date: string | null }>(
            `${BASE_URL}/tutores/${id_tutor}/earliest-week`
        );
        return response.data.earliest_date;
    }
};
