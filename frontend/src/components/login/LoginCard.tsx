import { LoginHeader } from "./LoginHeader";
import { LoginForm } from "./LoginForm";
import type { UserRole } from "../../types/auth.types";

interface Props {
  onLogin: (usuario: string, rol: UserRole, token: string) => void;
}

export function LoginCard({ onLogin }: Props) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp border border-gray-100 backdrop-blur-xl">

      <div className="h-1.5 bg-gradient-to-r from-green-600 via-green-500 to-green-600"></div>

      <div>
        <div className="p-8 border-b border-gray-100">
          <LoginHeader />
        </div>
        <LoginForm onLogin={onLogin} />
      </div>

      <div className="h-1 bg-gradient-to-r from-transparent via-green-200 to-transparent"></div>
    </div>
  );
}
