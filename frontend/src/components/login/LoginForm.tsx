import { useState } from "react";
<<<<<<< Updated upstream
import type { UserRole } from "../../types/auth.types";
=======
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import type { User, UserRole } from "../../types/auth.types";
>>>>>>> Stashed changes

interface LoginFormProps {
  onLogin: (usuario: User) => void;
}

// Usuarios de prueba
const DEMO_USERS = {
  admin: { password: "admin123", rol: "ADMINISTRADOR" as UserRole },
  administrativo: { password: "admin123", rol: "ADMINISTRATIVO" as UserRole },
  tutor: { password: "tutor123", rol: "TUTOR" as UserRole }
};

export function LoginForm({ onLogin }: LoginFormProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    await new Promise((res) => setTimeout(res, 500));

    const user = DEMO_USERS[usuario as keyof typeof DEMO_USERS];

    if (user && user.password === password) {
<<<<<<< Updated upstream
      onLogin(usuario, user.rol);
    } else {
      setError("Usuario o contraseña incorrectos");
    }

=======
      const usuarioLogeado = {
        id: 1, // ⚠ Puedes cambiarlo si deseas IDs distintos
        nombres: usuario, 
        apellidos: "",
        correo: usuario,
        rol: user.rol
      } 
      onLogin(usuarioLogeado);
    }else {
        setError("Usuario o contraseña incorrectos. Intenta de nuevo.");
        // Clear password on error
        setPassword("");
      }
>>>>>>> Stashed changes
    setLoading(false);
    return;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleSubmit();
  };

  return (
    <div className="p-8 space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Usuario
        </label>
        <input
          type="text"
          placeholder="Ingrese su usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full h-12 px-4 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-primary-500
                     disabled:bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full h-12 px-4 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-primary-500
                     disabled:bg-gray-100"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-12 bg-green-600 text-white font-semibold rounded-lg
                   hover:bg-green-700 hover:shadow-lg
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Usuarios de prueba:
        </p>
        <div className="space-y-1 text-xs text-gray-600">
          <p><span className="font-bold">Administrador:</span> admin / admin123</p>
          <p><span className="font-bold">Administrativo:</span> administrativo / admin123</p>
          <p><span className="font-bold">Tutor:</span> tutor / tutor123</p>
        </div>
      </div>
    </div>
  );
}
