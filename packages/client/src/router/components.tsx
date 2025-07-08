import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.js';

/**
 * Componente de layout principal para las páginas autenticadas.
 * En el futuro aquí irá la barra de navegación, el header, etc.
 */
export const AppLayout = () => {
  return (
    <div>
      <h1>Pool Control App</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

/**
 * Componente que protege rutas genéricas de usuarios no autenticados.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

/**
 * Componente que protege rutas específicas para el rol SUPER_ADMIN.
 */
export const SuperAdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (user?.role !== 'SUPER_ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
};