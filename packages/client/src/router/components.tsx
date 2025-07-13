// filename: packages/client/src/router/components.tsx
// version: 1.8.0 (FEAT: Add reports link to navbar)

import { AppShell, Burger, Group, NavLink, Title, Button, Indicator, ActionIcon, Popover, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.js';
import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient.js';

// --- Tipos para la notificación ---
interface Notification {
  id: string;
  message: string;
  visitId: string | null;
  parentNotificationId: string | null; 
  isRead: boolean;
}

// --- Componente de Notificaciones (la campana y su lógica) ---
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
      try {
        await apiClient.post(`/notifications/${notification.id}/read`);
        fetchNotifications();
      } catch (error) {
        console.error('Failed to mark notification as read', error);
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
          <Group>
            {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && <NotificationBell />}
            <Button variant="light" onClick={handleLogout}>Cerrar Sesión</Button>
          </Group>
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
            <NavLink
              component={Link}
              to="/incidents-history"
              label="Historial de Incidencias"
              onClick={toggle}
            />
            {/* ✅ AÑADIDO: Enlace a la nueva página de informes */}
            <NavLink
              component={Link}
              to="/reports/consumption"
              label="Informe de Consumos"
              onClick={toggle}
            />
            <NavLink label="Catálogos" defaultOpened>
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
              <NavLink 
                component={Link} 
                to="/catalog/products" 
                label="Productos" 
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
  if (user?.role !== 'TECHNICIAN') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};