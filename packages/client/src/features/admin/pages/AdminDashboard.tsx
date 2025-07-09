// filename: packages/client/src/features/admin/pages/AdminDashboard.tsx
// version: 1.0.2
// description: Corrige la navegación programática desde la lista de incidencias.

import { useEffect, useState } from 'react';
import { Container, Title, Grid, Paper, Text, Badge, Loader, Alert, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom'; // <-- 1. Importar useNavigate
import apiClient from '../../../api/apiClient';
import { format } from 'date-fns';
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
}

// --- Componente Principal ---
export function AdminDashboard() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // <-- 2. Inicializar el hook

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [visitsResponse, notificationsResponse] = await Promise.all([
          apiClient.get('/visits/scheduled', { params: { date: new Date().toISOString() } }),
          apiClient.get('/notifications')
        ]);
        
        const today = new Date().toDateString();
        const todayVisits = visitsResponse.data.data.filter((v: Visit) => 
            new Date(v.timestamp).toDateString() === today
        );
        
        setVisits(todayVisits);
        setNotifications(notificationsResponse.data.data);
      } catch (err) {
        setError('No se pudo cargar la información del dashboard.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 3. Nueva función para manejar el click ---
  const handleIncidentClick = (notification: Notification) => {
    if (notification.visitId) {
      navigate(`/visits/${notification.visitId}`);
    }
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
                  <Paper key={visit.id} withBorder p="sm" radius="md">
                    <Grid align="center">
                      <Grid.Col span={8}>
                        <Text fw={500}>{visit.pool.name}</Text>
                        <Text size="sm" c="dimmed">{visit.pool.client.name}</Text>
                        <Text size="xs" c="dimmed">Técnico: {visit.technician?.name || 'Sin asignar'}</Text>
                      </Grid.Col>
                      <Grid.Col span={4} ta="right">
                        <Badge color={visit.status === 'COMPLETED' ? 'green' : 'blue'}>
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
            <Title order={4} mb="md">Últimas Incidencias</Title>
             <Stack>
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  // --- 4. Simplificamos el renderizado ---
                  // Quitamos el <Link> y añadimos el onClick al Paper
                  <Paper 
                    key={notification.id} 
                    withBorder p="sm" radius="md" 
                    onClick={() => handleIncidentClick(notification)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Text size="sm">{notification.message}</Text>
                  </Paper>
                ))
              ) : (
                <Text c="dimmed">No hay incidencias pendientes.</Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}