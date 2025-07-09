// filename: packages/client/src/features/technician/pages/MyRoutePage.tsx
// Version: 1.0.0 (Initial implementation of the technician's daily route page)
import { useEffect, useState } from 'react';
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
} from '@mantine/core';
import apiClient from '../../../api/apiClient';

// --- Tipos ---
interface Visit {
  id: string;
  timestamp: string;
  pool: {
    id: string;
    name: string;
    address: string;
    client: {
      name: string;
    };
  };
  // Agregaremos más campos a medida que los necesitemos (ej. estado)
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function MyRoutePage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyRoute = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ApiResponse<Visit[]>>('/visits/my-route');
        setVisits(response.data.data);
      } catch (err) {
        setError('No se pudo cargar tu ruta del día.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRoute();
  }, []);

  if (isLoading) {
    return (
      <Container style={{ textAlign: 'center', paddingTop: '50px' }}>
        <Loader size="xl" />
        <Text mt="md">Cargando tu ruta...</Text>
      </Container>
    );
  }

  if (error) {
    return <Alert color="red" title="Error">{error}</Alert>;
  }

  const visitCards = visits.map((visit) => (
    <Card key={visit.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} size="lg">{visit.pool.name}</Text>
        <ThemeIcon variant="light" radius="md" size="lg">
          {/* Aquí podríamos poner un icono de estado (pendiente, completado, etc.) */}
          <span>📍</span>
        </ThemeIcon>
      </Group>

      <Text size="sm" c="dimmed">
        Cliente: {visit.pool.client.name}
      </Text>

      <Anchor
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.pool.address)}`}
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        mt="sm"
      >
        {visit.pool.address}
      </Anchor>
    </Card>
  ));

  return (
    <Container>
      <Title order={2} my="lg">Mi Ruta de Hoy</Title>
      {visits.length > 0 ? (
        <Stack gap="md">{visitCards}</Stack>
      ) : (
        <Text>No tienes visitas asignadas para hoy.</Text>
      )}
    </Container>
  );
}