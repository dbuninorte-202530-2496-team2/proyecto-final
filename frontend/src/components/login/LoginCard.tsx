import { LoginHeader } from "./LoginHeader";
import { LoginForm } from "./LoginForm";
<<<<<<< Updated upstream
<<<<<<< Updated upstream

interface Props {
  onLogin: any;
=======
import type { User } from "../../types/auth.types";

interface Props {
  onLogin: (usuario: User) => void;
>>>>>>> Stashed changes
=======
import type { User } from "../../types/auth.types";

interface Props {
  onLogin: (usuario: User) => void;
>>>>>>> Stashed changes
}

export function LoginCard({ onLogin }: Props) {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
      <LoginHeader />
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
