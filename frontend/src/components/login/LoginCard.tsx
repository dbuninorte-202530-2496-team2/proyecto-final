import { LoginHeader } from "./LoginHeader";
import { LoginForm } from "./LoginForm";

interface Props {
  onLogin: any;
}

export function LoginCard({ onLogin }: Props) {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
      <LoginHeader />
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
