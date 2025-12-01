import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor - adds JWT token if available
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles errors and shows toasts
apiClient.interceptors.response.use(
    (response) => {
        // Success response - show toast for mutations (POST, PUT, DELETE, PATCH)
        const method = response.config.method?.toUpperCase();
        if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            // Extract success message from response if available
            const message = response.data?.message || getDefaultSuccessMessage(method);
            toast.success(message);
        }
        return response;
    },
    (error: AxiosError<{ message?: string; error?: string }>) => {
        // Error handling with automatic toast notifications
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const errorMessage = error.response.data?.message || error.response.data?.error || error.message;

            switch (status) {
                case 400:
                    toast.error(`Error de validación: ${errorMessage}`);
                    break;
                case 401:
                    toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
                    // Auto logout on 401
                    localStorage.removeItem('usuario');
                    localStorage.removeItem('rol');
                    localStorage.removeItem('token');
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                    break;
                case 403:
                    toast.error('No tienes permisos para realizar esta acción.');
                    break;
                case 404:
                    toast.error(`No encontrado: ${errorMessage}`);
                    break;
                case 409:
                    toast.error(`Conflicto: ${errorMessage}`);
                    break;
                case 500:
                    toast.error('Error del servidor. Por favor intenta de nuevo más tarde.');
                    break;
                default:
                    toast.error(`Error: ${errorMessage}`);
            }
        } else if (error.request) {
            // Request was made but no response received
            toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
            // Something else happened
            toast.error(`Error: ${error.message}`);
        }

        return Promise.reject(error);
    }
);

// Helper function to get default success messages
function getDefaultSuccessMessage(method: string): string {
    switch (method) {
        case 'POST':
            return 'Creado exitosamente';
        case 'PUT':
        case 'PATCH':
            return 'Actualizado exitosamente';
        case 'DELETE':
            return 'Eliminado exitosamente';
        default:
            return 'Operación exitosa';
    }
}

export default apiClient;
