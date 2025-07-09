// filename: packages/client/src/features/admin/pages/clients/ClientDetailPage.tsx
// Version: 1.2.0 (Make pool names link to their future detail page)
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
  Modal,
  TextInput,
  Stack,
  NumberInput,
  Select,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
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
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  const poolForm = useForm({
    initialValues: {
      name: '',
      address: '',
      volume: null as number | null,
      type: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'El nombre es demasiado corto' : null),
      address: (value) => (value.trim().length < 5 ? 'La dirección es demasiado corta' : null),
    },
  });

  const fetchClient = async () => {
    if (!clientId) return;
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

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleOpenModal = (pool: Pool | null = null) => {
    setEditingPool(pool);
    if (pool) {
      poolForm.setValues({
        name: pool.name,
        address: pool.address,
        volume: pool.volume,
        type: pool.type || '',
      });
    } else {
      poolForm.reset();
    }
    openModal();
  };

  const handlePoolSubmit = async (values: typeof poolForm.values) => {
    if (!clientId) return;
    try {
      const payload = { ...values, clientId };
      if (editingPool) {
        await apiClient.patch(`/pools/${editingPool.id}`, payload);
      } else {
        await apiClient.post('/pools', payload);
      }
      await fetchClient();
      closeModal();
    } catch (err: any) {
      poolForm.setErrors({ name: err.response?.data?.message || 'Error al guardar la piscina' });
    }
  };

  const handlePoolDelete = async (poolId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta piscina?')) {
      try {
        await apiClient.delete(`/pools/${poolId}`);
        await fetchClient();
      } catch (err) {
        console.error('Failed to delete pool', err);
      }
    }
  };


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
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingPool ? 'Editar Piscina' : 'Crear Nueva Piscina'}
        centered
      >
        <form onSubmit={poolForm.onSubmit(handlePoolSubmit)}>
          <Stack>
            <TextInput required label="Nombre de la Piscina" placeholder="Ej. Piscina Principal" {...poolForm.getInputProps('name')} />
            <TextInput required label="Dirección de la Piscina" {...poolForm.getInputProps('address')} />
            <NumberInput label="Volumen (m³)" placeholder="Ej. 50" min={0} {...poolForm.getInputProps('volume')} />
            <Select label="Tipo de Piscina" data={['Cloro', 'Sal']} {...poolForm.getInputProps('type')} />
            <Button type="submit" mt="md">{editingPool ? 'Guardar Cambios' : 'Crear Piscina'}</Button>
          </Stack>
        </form>
      </Modal>
    
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
          <Button onClick={() => handleOpenModal()}>Crear Nueva Piscina</Button>
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
                  <Table.Td>
                    <Anchor component={Link} to={`/pools/${pool.id}`}>
                      {pool.name}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{pool.address}</Table.Td>
                  <Table.Td>{pool.volume || '-'}</Table.Td>
                  <Table.Td>{pool.type || '-'}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button variant="subtle" size="xs" onClick={() => handleOpenModal(pool)}>Editar</Button>
                      <Button variant="subtle" size="xs" color="red" onClick={() => handlePoolDelete(pool.id)}>Eliminar</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr><Table.Td colSpan={5}>Este cliente no tiene piscinas asociadas.</Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Container>
    </>
  );
}