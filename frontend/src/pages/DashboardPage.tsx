import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Dashboard/Dashboard';

export function DashboardPage() {
  const { usuario, rol, logout } = useAuth();

  if (!usuario || !rol) {
    return null; // O un loader
  }

  return (
    <Dashboard />
  );
}