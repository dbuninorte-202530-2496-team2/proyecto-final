import { Globe } from "lucide-react";

export function LoginHeader() {
  return (
    <div className="text-center space-y-4 pb-6 border-b border-gray-200">
      {/* Logo animado */}
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg animate-scaleIn hover:shadow-2xl transition-shadow">
        <Globe className="w-10 h-10 text-white animate-fadeInUp" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-green-700 animate-slideInDown" style={{ animationDelay: "0.1s" }}>
          GlobalEnglish
        </h1>
        <p className="text-base mt-2 text-gray-600 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          Sistema de Gestión del Programa de Bilingüismo
        </p>
      </div>
    </div>
  );
}
