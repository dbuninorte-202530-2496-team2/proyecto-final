import apiClient from './api-client';

// Types matching backend DTOs
export type Jornada = 'UNICA_MANANA' | 'UNICA_TARDE' | 'MANANA_Y_TARDE';

export interface Institucion {
    id: number;
    nombre: string;
    correo: string;
    jornada: Jornada;
    nombre_contacto: string;
    telefono_contacto: string;
}

export interface CreateInstitucionDto {
    nombre: string;
    correo: string;
    jornada: Jornada;
    nombre_contacto: string;
    telefono_contacto: string;
}

export interface UpdateInstitucionDto {
    nombre?: string;
    correo?: string;
    jornada?: Jornada;
    nombre_contacto?: string;
    telefono_contacto?: string;
}

// Instituciones Service
class InstitucionesService {
    private readonly BASE_PATH = '/instituciones';

    async getAll(): Promise<Institucion[]> {
        const response = await apiClient.get<Institucion[]>(this.BASE_PATH);
        return response.data;
    }

    async getById(id: number): Promise<Institucion> {
        const response = await apiClient.get<Institucion>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    async create(data: CreateInstitucionDto): Promise<Institucion> {
        const response = await apiClient.post<Institucion>(this.BASE_PATH, data);
        return response.data;
    }

    async update(id: number, data: UpdateInstitucionDto): Promise<Institucion> {
        const response = await apiClient.put<Institucion>(`${this.BASE_PATH}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const institucionesService = new InstitucionesService();
