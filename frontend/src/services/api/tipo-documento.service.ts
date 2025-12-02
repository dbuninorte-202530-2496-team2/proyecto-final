import apiClient from './api-client';

// Backend response type
interface TipoDocumentoBackend {
    id: number;
    codigo: string;
    descripcion: string;
}

// Frontend type (matches existing types)
export interface TipoDocumento {
    id: number;
    sigla: string;
    nombre: string;
}

// Tipo Documento Service
class TipoDocumentoService {
    private readonly BASE_PATH = '/tipo-documento';

    // Transform backend response to frontend format
    private transformResponse(backend: TipoDocumentoBackend): TipoDocumento {
        return {
            id: backend.id,
            sigla: backend.codigo,
            nombre: backend.descripcion,
        };
    }

    async getAll(): Promise<TipoDocumento[]> {
        const response = await apiClient.get<TipoDocumentoBackend[]>(this.BASE_PATH);
        return response.data.map(item => this.transformResponse(item));
    }

    async getById(id: number): Promise<TipoDocumento> {
        const response = await apiClient.get<TipoDocumentoBackend>(`${this.BASE_PATH}/${id}`);
        return this.transformResponse(response.data);
    }

    async create(data: Omit<TipoDocumento, 'id'>): Promise<TipoDocumento> {
        // Backend expects { codigo, descripcion }
        const payload = {
            codigo: data.sigla,
            descripcion: data.nombre,
        };
        const response = await apiClient.post<TipoDocumentoBackend>(this.BASE_PATH, payload);
        return this.transformResponse(response.data);
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.BASE_PATH}/${id}`);
    }
}

export const tipoDocumentoService = new TipoDocumentoService();
