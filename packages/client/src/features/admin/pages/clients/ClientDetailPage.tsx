// filename: packages/client/src/features/admin/pages/clients/ClientDetailPage.tsx
// Version: 1.0.1 (Clean up unused imports)
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Loader,
  Alert,
  Button,
  Group,
  Paper,
  Text,
  Table,
  Breadcrumbs,
} from '@mantine/core';
import apiClient from '../../../../api/apiClient.js';

// --- Tipos ---
interface Pool {
  id: string;
  name: string;
  address: string;
  volume: number | null;
  type: string | null;
}

interface Client {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  pools: Pool[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function ClientDetailPage() {
  const { id: clientId } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    const fetchClient = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<ApiResponse<Client>>(`/clients/${clientId}`);
        setClient(response.data.data);
      } catch (err) {
        setError('No se pudo cargar la información del cliente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!client) return <Alert color="yellow" title="Aviso">Cliente no encontrado.</Alert>;

  const breadcrumbs = (
    <Breadcrumbs>
      <Link to="/clients">Clientes</Link>
      <Text>{client.name}</Text>
    </Breadcrumbs>
  );

  return (
    <Container fluid>
      {breadcrumbs}
      <Title order={2} my="lg">{client.name}</Title>
      <Paper withBorder p="md" mb="xl">
        <Title order={4} mb="xs">Información de Contacto</Title>
        <Text><strong>Persona de contacto:</strong> {client.contactPerson || '-'}</Text>
        <Text><strong>Email:</strong> {client.email || '-'}</Text>
        <Text><strong>Teléfono:</strong> {client.phone || '-'}</Text>
        <Text><strong>Dirección de facturación:</strong> {client.address || '-'}</Text>
      </Paper>
      
      <Group justify="space-between" align="center" mb="md">
        <Title order={3}>Piscinas</Title>
        <Button>Crear Nueva Piscina</Button>
      </Group>

      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Dirección</Table.Th>
            <Table.Th>Volumen (m³)</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {client.pools.length > 0 ? (
            client.pools.map(pool => (
              <Table.Tr key={pool.id}>
                <Table.Td>{pool.name}</Table.Td>
                <Table.Td>{pool.address}</Table.Td>
                <Table.Td>{pool.volume || '-'}</Table.Td>
                <Table.Td>{pool.type || '-'}</Table.Td>
                <Table.Td>{/* Acciones de la piscina aquí */}</Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr><Table.Td colSpan={5}>Este cliente no tiene piscinas asociadas.</Table.Td></Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Container>
  );
}