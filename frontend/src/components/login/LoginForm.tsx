import { useState } from "react";
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import type { UserRole } from "../../types/auth.types";
import axios from "axios";

interface LoginFormProps {
  onLogin: (usuario: string, rol: UserRole, token: string, personalId: number) => void;
}

interface ValidationErrors {
  usuario?: string;
  password?: string;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Validaciones
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!usuario.trim()) {
      errors.usuario = "El usuario es requerido";
    }
    if (!password) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${apiUrl}/auth/login`, {
        usuario,
        contrasena: password
      });

      // Backend returns: { id, usuario, contrasena, rol, token }
      const { id, token, rol } = response.data;

      if (token && rol && id) {
        onLogin(usuario, rol as UserRole, token, id);
      } else {
        console.error('Invalid response structure:', response.data);
        setError("Error en la respuesta del servidor. Intenta de nuevo.");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Error al conectar con el servidor. Verifica tu conexión.");
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && usuario && password) {
      handleSubmit();
    }
  };

  const usuarioIsValid = usuario.trim() && !validationErrors.usuario;
  const passwordIsValid = password && !validationErrors.password;

  return (
    <div className="p-8 space-y-6">
      {/* Campo Usuario */}
      <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Usuario <span className="text-red-500">*</span>
          </label>
          {usuarioIsValid && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Ingrese su usuario"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              if (validationErrors.usuario) {
                setValidationErrors({ ...validationErrors, usuario: undefined });
              }
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setFocusedField("usuario")}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            className={`w-full h-12 px-4 border-2 rounded-lg transition-all duration-200
                       ${focusedField === "usuario" ? "border-green-600 bg-green-50" : "border-gray-300"}
                       ${validationErrors.usuario ? "border-red-500 bg-red-50" : ""}
                       ${usuarioIsValid ? "border-green-500 bg-green-50" : ""}
                       focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-0
                       disabled:bg-gray-100 disabled:cursor-not-allowed
                       placeholder:text-gray-400 text-gray-900
                       `}
          />
        </div>
        {validationErrors.usuario && (
          <div className="flex items-center gap-2 text-red-600 text-xs animate-slideInDown">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.usuario}
          </div>
        )}
      </div>

      {/* Campo Contraseña */}
      <div className="space-y-2 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Contraseña <span className="text-red-500">*</span>
          </label>
          {passwordIsValid && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors({ ...validationErrors, password: undefined });
              }
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            className={`w-full h-12 px-4 pr-12 border-2 rounded-lg transition-all duration-200
                       ${focusedField === "password" ? "border-green-600 bg-green-50" : "border-gray-300"}
                       ${validationErrors.password ? "border-red-500 bg-red-50" : ""}
                       ${passwordIsValid ? "border-green-500 bg-green-50" : ""}
                       focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-0
                       disabled:bg-gray-100 disabled:cursor-not-allowed
                       placeholder:text-gray-400 text-gray-900
                       `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {validationErrors.password && (
          <div className="flex items-center gap-2 text-red-600 text-xs animate-slideInDown">
            <AlertCircle className="w-4 h-4" />
            {validationErrors.password}
          </div>
        )}
      </div>

      {/* Mensaje de error general */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slideInDown">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Botón de envío */}
      <button
        onClick={handleSubmit}
        disabled={loading || !usuario.trim() || !password}
        className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg
                   hover:from-green-700 hover:to-green-800 hover:shadow-lg
                   disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none
                   transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                   shadow-md
                   animate-fadeInUp"
        style={{ animationDelay: "0.3s" }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Iniciando sesión...</span>
          </div>
        ) : (
          "Iniciar Sesión"
        )}
      </button>

      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
        <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span></span> Usuarios de prueba disponibles:
        </p>
        <div className="space-y-2 text-xs text-blue-800">
          <div className="bg-white/60 p-2 rounded border border-blue-200 hover:bg-white transition-colors">
            <span className="font-bold text-blue-900">Administrador:</span>
            <span className="text-gray-600"> administrador / admin123</span>
          </div>
          <div className="bg-white/60 p-2 rounded border border-blue-200 hover:bg-white transition-colors">
            <span className="font-bold text-blue-900">Administrativo:</span>
            <span className="text-gray-600"> administrativo / admin123</span>
          </div>
          <div className="bg-white/60 p-2 rounded border border-blue-200 hover:bg-white transition-colors">
            <span className="font-bold text-blue-900">Tutor:</span>
            <span className="text-gray-600"> tutor / tutor123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
