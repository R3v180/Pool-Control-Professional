// filename: packages/client/src/features/admin/pages/AdminDashboard.tsx
// version: 2.0.1 (FIX: Align with new visits API)

import { useEffect, useState } from 'react';
import { Container, Title, Grid, Paper, Text, Badge, Loader, Alert, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
// ✅ 1. Importar las funciones de fecha necesarias
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Tipos de Datos ---
interface Visit {
  id: string;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  pool: { name: string; client: { name:string } };
  technician: { name: string } | null;
}

interface Notification {
  id: string;
  message: string;
  visitId: string | null;
  isCritical: boolean;
}

// --- Componente Principal ---
export function AdminDashboard() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // ✅ 2. Definir el rango de fechas para hoy
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // ✅ 3. Actualizar la llamada a la API para usar startDate y endDate
        const [visitsResponse, notificationsResponse] = await Promise.all([
          apiClient.get('/visits/scheduled', { 
            params: { 
              startDate: todayStart.toISOString(),
              endDate: todayEnd.toISOString(),
            } 
          }),
          apiClient.get('/notifications/history') 
        ]);
        
        // ✅ 4. La respuesta ya viene filtrada por el backend, no necesitamos filtrar de nuevo en el cliente.
        const todayVisits = visitsResponse.data.data;
        
        const allNotifications = notificationsResponse.data.data.notifications;
        const pendingNotifications = allNotifications.filter((n: any) => n.status === 'PENDING');

        setVisits(todayVisits);
        setNotifications(pendingNotifications);
      } catch (err) {
        setError('No se pudo cargar la información del dashboard.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  return (
    <Container fluid>
      <Title order={2} mb="xl">
        Dashboard - {format(new Date(), 'eeee, d MMMM yyyy', { locale: es })}
      </Title>

      <Grid>
        {/* Columna de Visitas de Hoy */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="md" shadow="sm">
            <Title order={4} mb="md">Visitas de Hoy ({visits.length})</Title>
            <Stack>
              {visits.length > 0 ? (
                visits.map(visit => (
                  <Paper 
                    key={visit.id} 
                    withBorder p="sm" radius="md"
                    onClick={() => handleCardClick(`/visits/${visit.id}`)}
                    style={{ 
                      cursor: 'pointer',
                      opacity: visit.status === 'COMPLETED' ? 0.65 : 1,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <Grid align="center">
                      <Grid.Col span={8}>
                        <Text fw={500}>{visit.pool.name}</Text>
                        <Text size="sm" c="dimmed">{visit.pool.client.name}</Text>
                        <Text size="xs" c="dimmed">Técnico: {visit.technician?.name || 'Sin asignar'}</Text>
                      </Grid.Col>
                      <Grid.Col span={4} ta="right">
                        <Badge 
                          color={visit.status === 'COMPLETED' ? 'green' : 'blue'}
                          variant="light"
                        >
                          {visit.status}
                        </Badge>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                ))
              ) : (
                <Text c="dimmed">No hay visitas programadas para hoy.</Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Columna de Incidencias */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" shadow="sm">
            <Title order={4} mb="md">Incidencias Activas</Title>
             <Stack>
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <Paper 
                    key={notification.id} 
                    withBorder p="sm" radius="md" 
                    onClick={() => notification.visitId && handleCardClick(`/incidents/${notification.id}`)}
                    style={{ 
                      cursor: notification.visitId ? 'pointer' : 'default',
                      borderLeft: notification.isCritical ? '4px solid var(--mantine-color-red-7)' : undefined,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <Text size="sm">{notification.message}</Text>
                  </Paper>
                ))
              ) : (
                <Text c="dimmed">No hay incidencias activas.</Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}