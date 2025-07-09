// filename: packages/client/src/router/components.tsx
// Version: 1.5.0 (Add TechnicianRoute and navigation link)
import { AppShell, Burger, Group, NavLink, Title, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.js';

/**
 * Componente de layout principal para las páginas autenticadas.
 */
export const AppLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>Pool Control Professional</Title>
          </Group>
          <Button variant="light" onClick={handleLogout}>Cerrar Sesión</Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          component={Link}
          to="/"
          label="Dashboard"
          onClick={toggle}
        />
        
        {/* Enlaces solo para el rol ADMIN */}
        {user?.role === 'ADMIN' && (
          <>
            <NavLink
              component={Link}
              to="/planner"
              label="Planificador"
              onClick={toggle}
            />
            <NavLink
              component={Link}
              to="/clients"
              label="Clientes"
              onClick={toggle}
            />
            <NavLink label="Catálogos">
              <NavLink 
                component={Link} 
                to="/catalog/parameters" 
                label="Parámetros" 
                onClick={toggle} 
              />
              <NavLink 
                component={Link} 
                to="/catalog/tasks" 
                label="Tareas" 
                onClick={toggle} 
              />
            </NavLink>
          </>
        )}

        {/* Enlaces solo para el rol TECHNICIAN */}
        {user?.role === 'TECHNICIAN' && (
          <NavLink
            component={Link}
            to="/my-route"
            label="Mi Ruta de Hoy"
            onClick={toggle}
          />
        )}

        {/* Enlaces solo para el rol SUPER_ADMIN */}
        {user?.role === 'SUPER_ADMIN' && (
           <NavLink 
              component={Link} 
              to="/superadmin/tenants" 
              label="Gestión de Tenants" 
              onClick={toggle} 
            />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
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

/**
 * Componente que protege rutas específicas para los roles ADMIN y SUPER_ADMIN.
 */
export const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

/**
 * Componente que protege rutas específicas para el rol TECHNICIAN.
 */
export const TechnicianRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  // Solo permite acceso si el rol es TECHNICIAN
  if (user?.role !== 'TECHNICIAN') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};