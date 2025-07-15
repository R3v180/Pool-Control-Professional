// filename: packages/client/src/features/admin/pages/planning/RouteTemplatesPage.tsx
// version: 1.0.0
// description: Página para listar las Rutas Maestras existentes.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Loader,
  Alert,
  Button,
  Group,
  Stack,
  Card,
  Text,
  Badge,
  SimpleGrid,
} from '@mantine/core';
import apiClient from '../../../../api/apiClient';

// --- Tipos de Datos del Frontend ---
// Reflejan la estructura que nos devuelve la API
interface Season {
  id: string;
  frequency: string;
  startDate: string;
  endDate: string;
}

interface RouteTemplate {
  id: string;
  name: string;
  dayOfWeek: string;
  technician: { id: string; name: string } | null;
  zones: { id: string; name: string }[];
  seasons: Season[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente Principal ---
export function RouteTemplatesPage() {
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ApiResponse<RouteTemplate[]>>('/route-templates');
        setTemplates(response.data.data);
      } catch (err) {
        setError('No se pudo cargar la lista de Rutas Maestras.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const routeCards = templates.map((template) => (
    <Card key={template.id} shadow="sm" p="lg" withBorder>
      <Stack h="100%">
        <Group justify="space-between">
          <Title order={4}>{template.name}</Title>
          <Badge size="lg">{template.dayOfWeek}</Badge>
        </Group>

        <Text>
          Técnico Habitual: <strong>{template.technician?.name || 'Sin asignar'}</strong>
        </Text>

        <div>
          <Text size="sm" fw={500}>Zonas Cubiertas:</Text>
          <Group gap="xs" mt={4}>
            {template.zones.map(zone => (
              <Badge key={zone.id} variant="light">{zone.name}</Badge>
            ))}
          </Group>
        </div>
        
        <Stack mt="auto">
            <Button component={Link} to={`/planning/routes/${template.id}`} variant="light">
                Editar Ruta
            </Button>
            <Button color="red" variant="outline" onClick={() => alert('Funcionalidad de borrado pendiente.')}>
                Eliminar
            </Button>
        </Stack>

      </Stack>
    </Card>
  ));

  return (
    <Container fluid>
      <Group justify="space-between" align="center" my="lg">
        <Title order={2}>Gestión de Rutas Maestras</Title>
        <Button component={Link} to="/planning/routes/new">
          Crear Nueva Ruta Maestra
        </Button>
      </Group>

      {templates.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {routeCards}
        </SimpleGrid>
      ) : (
        <Text c="dimmed" mt="xl">
          No hay Rutas Maestras creadas. Empieza por crear una para automatizar tu planificación.
        </Text>
      )}
    </Container>
  );
}