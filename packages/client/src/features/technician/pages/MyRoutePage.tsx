// filename: packages/client/src/features/technician/pages/MyRoutePage.tsx
// Version: 1.2.1 (FIXED - Decouple from @prisma/client)
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Container,
  Title,
  Loader,
  Alert,
  Stack,
  Card,
  Text,
  Group,
  Anchor,
  ThemeIcon,
  Badge,
  Divider,
} from '@mantine/core';
import apiClient from '../../../api/apiClient';

// --- Tipos del Frontend ---
// Definimos los tipos aquí, basándonos en lo que esperamos de la API,
// sin acoplar el frontend al backend.
type IncidentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

interface Visit {
  id: string;
  timestamp: string;
  pool: {
    id: string;
    name: string;
    address: string;
    client: { name: string; };
  };
}

interface AssignedTask {
  id: string;
  title: string;
  priority: IncidentPriority;
  notification: {
    id: string;
    visit: {
      pool: { name: string; };
    } | null;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function MyRoutePage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [visitsResponse, tasksResponse] = await Promise.all([
        apiClient.get<ApiResponse<Visit[]>>('/visits/my-route'),
        apiClient.get<ApiResponse<AssignedTask[]>>('/incident-tasks/my-tasks'),
      ]);
      setVisits(visitsResponse.data.data);
      setTasks(tasksResponse.data.data);
    } catch (err) {
      setError('No se pudo cargar tu trabajo del día.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.key]);

  if (isLoading) {
    return (
      <Container style={{ textAlign: 'center', paddingTop: '50px' }}>
        <Loader size="xl" />
        <Text mt="md">Cargando tu trabajo del día...</Text>
      </Container>
    );
  }

  if (error) {
    return <Alert color="red" title="Error">{error}</Alert>;
  }

  const taskCards = tasks.map((task) => (
    <Card key={task.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Link to={`/incidents/${task.notification.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Group justify="space-between" mb="xs">
          <Text fw={500} size="lg">{task.title}</Text>
          <Badge color={task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'red' : 'orange'}>
            {task.priority}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          Incidencia en: {task.notification.visit?.pool.name || 'Piscina no especificada'}
        </Text>
      </Link>
    </Card>
  ));

  const visitCards = visits.map((visit) => (
    <Card key={visit.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Link to={`/visits/${visit.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Group justify="space-between" mb="xs">
          <Text fw={500} size="lg">{visit.pool.name}</Text>
          <ThemeIcon variant="light" radius="md" size="lg"><span>📍</span></ThemeIcon>
        </Group>
        <Text size="sm" c="dimmed">Cliente: {visit.pool.client.name}</Text>
      </Link>
      <Anchor href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.pool.address)}`} target="_blank" rel="noopener noreferrer" size="sm" mt="sm">
        {visit.pool.address}
      </Anchor>
    </Card>
  ));

  return (
    <Container>
      <Title order={2} my="lg">Mi Trabajo de Hoy</Title>
      
      <Stack gap="xl">
        {tasks.length > 0 && (
          <Stack>
            <Title order={4} c="orange.7">Tareas Especiales</Title>
            {taskCards}
          </Stack>
        )}

        {visits.length > 0 && tasks.length > 0 && <Divider my="md" />}
        
        {visits.length > 0 && (
          <Stack>
            <Title order={4}>Visitas Programadas</Title>
            {visitCards}
          </Stack>
        )}

        {visits.length === 0 && tasks.length === 0 && (
          <Text>No tienes trabajo asignado para hoy.</Text>
        )}
      </Stack>
    </Container>
  );
}