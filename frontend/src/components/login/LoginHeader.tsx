import { Globe } from "lucide-react";

export function LoginHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-700 rounded-full flex items-center justify-center">
        <Globe className="w-10 h-10 text-white" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-green-700">GlobalEnglish</h1>
        <p className="text-base mt-2 text-gray-600">
          Sistema de Gestión del Programa de Bilingüismo
        </p>
      </div>
    </div>
  );
}
