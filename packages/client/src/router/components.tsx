// filename: packages/client/src/router/components.tsx
// version: 2.6.3 (FEAT: Add AccountStatusPage to navigation)
// description: Se añade el enlace a la nueva página de Estado de Cuentas en el menú de navegación de ADMIN y MANAGER.

import { AppShell, Burger, Group, NavLink, Title, Button, Indicator, ActionIcon, Popover, Text, Stack, SegmentedControl } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.js';
import type { ViewAsRole } from '../providers/AuthProvider.js';
import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient.js';

interface Notification {
  id: string;
  message: string;
  visitId: string | null;
  parentNotificationId: string | null;
  isRead: boolean;
}

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

export const AppLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout, activeView, setViewAs, activeRole } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleViewChange = (value: string) => {
    const role = value as ViewAsRole;
    setViewAs(role);
    if (role === 'ADMIN' || role === 'MANAGER') navigate('/');
    if (role === 'TECHNICIAN') navigate('/my-route');
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
            {activeRole === 'ADMIN' && <NotificationBell />}
            <Button variant="light" onClick={handleLogout}>Cerrar Sesión</Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {activeRole === 'MANAGER' && (
          <>
            <NavLink
              component={Link}
              to="/"
              label="Dashboard de Gerencia"
              onClick={toggle}
            />
            {/* ✅ El manager también ve el menú de finanzas */}
            <NavLink label="Finanzas" defaultOpened>
                <NavLink component={Link} to="/financials/account-status" label="Estado de Cuentas" onClick={toggle} />
            </NavLink>
          </>
        )}
        
        {activeRole === 'ADMIN' && (
          <>
            <NavLink component={Link} to="/" label="Dashboard de Admin" onClick={toggle} />
            
            <NavLink label="Planificación" defaultOpened>
                <NavLink component={Link} to="/planning/zones" label="Gestión de Zonas" onClick={toggle}/>
                <NavLink component={Link} to="/planning/routes" label="Gestión de Rutas" onClick={toggle}/>
                <NavLink component={Link} to="/planning/availability" label="Gestión de Disponibilidad" onClick={toggle}/>
                <NavLink component={Link} to="/planner" label="Planificador" onClick={toggle} /> 
            </NavLink>

            <NavLink component={Link} to="/clients" label="Clientes" onClick={toggle} />
            <NavLink component={Link} to="/incidents-history" label="Gestión de Incidencias" onClick={toggle} />
            <NavLink label="Informes" defaultOpened>
                <NavLink component={Link} to="/reports/invoicing" label="Informe para Facturación" onClick={toggle}/>
                <NavLink component={Link} to="/reports/consumption" label="Informe de Consumos" onClick={toggle}/>
             </NavLink>
            <NavLink label="Catálogos" defaultOpened>
              <NavLink component={Link} to="/catalog/parameters" label="Parámetros" onClick={toggle} />
              <NavLink component={Link} to="/catalog/tasks" label="Tareas" onClick={toggle} />
              <NavLink component={Link} to="/catalog/products" label="Productos" onClick={toggle} />
              <NavLink component={Link} to="/catalog/product-categories" label="Categorías de Productos" onClick={toggle} />
            </NavLink>
            <NavLink label="Finanzas" defaultOpened>
                {/* ✅ NUEVO ENLACE AÑADIDO */}
                <NavLink component={Link} to="/financials/account-status" label="Estado de Cuentas" onClick={toggle} />
                <NavLink component={Link} to="/financials/payments" label="Pagos Recibidos" onClick={toggle} />
                <NavLink component={Link} to="/financials/expenses" label="Gastos Generales" onClick={toggle} />
            </NavLink>
          </>
         )}

        {activeRole === 'TECHNICIAN' && (
          <NavLink component={Link} to="/my-route" label="Mi Ruta de Hoy" onClick={toggle} />
        )}

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
  const { activeRole, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (activeRole !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
export const TechnicianRoute = () => {
  const { activeRole, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (activeRole !== 'TECHNICIAN') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
export const FinancialAdminRoute = () => {
    const { activeRole, isLoading } = useAuth();
    if (isLoading) return <div>Cargando...</div>;
    if (activeRole !== 'MANAGER' && activeRole !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
};