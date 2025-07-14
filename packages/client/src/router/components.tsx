// filename: packages/client/src/router/components.tsx
// version: 2.0.0 (FEAT: Implement Manager 'View As' functionality)

import { AppShell, Burger, Group, NavLink, Title, Button, Indicator, ActionIcon, Popover, Text, Stack, SegmentedControl } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.js';
import type { ViewAsRole } from '../providers/AuthProvider.js'; // Importamos el tipo
import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient.js';

// --- Tipos para la notificación (sin cambios) ---
interface Notification {
  id: string;
  message: string;
  visitId: string | null;
  parentNotificationId: string | null;
  isRead: boolean;
}

// --- Componente de Notificaciones (sin cambios) ---
const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Notification[] }>('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications(current =>
        current.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      try {
        await apiClient.post(`/notifications/${notification.id}/read`);
      } catch (error) {
        console.error('Failed to mark notification as read', error);
        fetchNotifications();
      }
    }
    
    const incidentId = notification.parentNotificationId || notification.id;
    navigate(`/incidents/${incidentId}`);
    
    setPopoverOpened(false);
  };
  
  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <Popover opened={popoverOpened} onChange={setPopoverOpened} width={300} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <Indicator color="red" disabled={!hasUnread} withBorder processing>
          <ActionIcon variant="default" size="lg" onClick={() => setPopoverOpened((o) => !o)}>
            🔔
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack>
          <Text fw={500}>Notificaciones</Text>
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <Text
                key={notification.id}
                size="sm"
                onClick={() => handleNotificationClick(notification)}
                style={{
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '4px',
                  fontWeight: notification.isRead ? 400 : 700,
                  color: notification.isRead ? 'gray' : 'black',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {notification.message}
              </Text>
            ))
          ) : (
            <Text size="sm" c="dimmed">No hay notificaciones pendientes.</Text>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};


/**
 * Componente de layout principal para las páginas autenticadas.
 */
export const AppLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  // --- ✅ USAMOS LOS NUEVOS ELEMENTOS DEL AUTHPROVIDER ---
  const { user, logout, activeView, setViewAs, activeRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleViewChange = (value: string) => {
    const role = value as ViewAsRole;
    setViewAs(role);
    // Redirigir al dashboard correspondiente
    if (role === 'ADMIN') navigate('/');
    if (role === 'TECHNICIAN') navigate('/my-route');
    if (role === 'MANAGER') navigate('/');
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
            <Title order={3}>Pool Control Pro</Title>
          </Group>
          <Group>
            {/* ✅ El selector de vista solo es visible para el MANAGER */}
            {user?.role === 'MANAGER' && (
              <SegmentedControl
                value={activeView}
                onChange={handleViewChange}
                data={[
                  { label: 'Gerencia', value: 'MANAGER' },
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Técnico', value: 'TECHNICIAN' },
                ]}
              />
            )}
            {/* ✅ La campana se muestra si eres ADMIN o si eres MANAGER en vista de ADMIN */}
            {activeRole === 'ADMIN' && <NotificationBell />}
            <Button variant="light" onClick={handleLogout}>Cerrar Sesión</Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* ✅ Usamos activeRole en lugar de user.role */}
        
        {/* Enlaces para la vista de MANAGER */}
        {activeRole === 'MANAGER' && (
          <NavLink
            component={Link}
            to="/"
            label="Dashboard de Gerencia"
            onClick={toggle}
          />
        )}
        
        {/* Enlaces para la vista de ADMIN */}
        {activeRole === 'ADMIN' && (
          <>
            <NavLink component={Link} to="/" label="Dashboard de Admin" onClick={toggle} />
            <NavLink component={Link} to="/planner" label="Planificador" onClick={toggle} />
            <NavLink component={Link} to="/clients" label="Clientes" onClick={toggle} />
            <NavLink component={Link} to="/incidents-history" label="Historial de Incidencias" onClick={toggle} />
            <NavLink label="Catálogos" defaultOpened>
              <NavLink component={Link} to="/catalog/parameters" label="Parámetros" onClick={toggle} />
              <NavLink component={Link} to="/catalog/tasks" label="Tareas" onClick={toggle} />
              <NavLink component={Link} to="/catalog/products" label="Productos" onClick={toggle} />
            </NavLink>
          </>
        )}

        {/* Enlaces para la vista de TECHNICIAN */}
        {activeRole === 'TECHNICIAN' && (
          <NavLink component={Link} to="/my-route" label="Mi Ruta de Hoy" onClick={toggle} />
        )}

        {/* Enlaces solo para el rol SUPER_ADMIN (no cambia) */}
        {user?.role === 'SUPER_ADMIN' && (
           <NavLink component={Link} to="/superadmin/tenants" label="Gestión de Tenants" onClick={toggle} />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};


/**
 * El resto de componentes de protección de rutas no necesitan cambios,
 * ya que se basan en el rol REAL del usuario (`user.role`) para la seguridad,
 * lo cual es correcto. La vista es solo una capa de presentación.
 */

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const SuperAdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (user?.role !== 'SUPER_ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  // ✅ MODIFICACIÓN IMPORTANTE: Se permite el acceso si es ADMIN o si es MANAGER
  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export const TechnicianRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  // ✅ MODIFICACIÓN IMPORTANTE: Se permite el acceso si es TECHNICIAN o si es MANAGER
  if (user?.role !== 'TECHNICIAN' && user?.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};