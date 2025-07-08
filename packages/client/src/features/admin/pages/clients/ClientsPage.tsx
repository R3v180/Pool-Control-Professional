// filename: packages/client/src/features/admin/pages/clients/ClientsPage.tsx
// Version: 1.1.0 (Make client names link to their detail page)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Table,
  Loader,
  Alert,
  Button,
  Group,
  Modal,
  TextInput,
  Stack,
  NumberInput,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../../api/apiClient.js';

// --- Tipos ---
interface Client {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  priceModifier: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      priceModifier: 1.0,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'El nombre es demasiado corto' : null),
      email: (value) => (value && !/^\S+@\S+$/.test(value) ? 'Email inválido' : null),
      priceModifier: (value) => (value <= 0 ? 'El modificador debe ser mayor que 0' : null),
    },
  });

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<Client[]>>('/clients');
      setClients(response.data.data);
    } catch (err) {
      setError('No se pudo cargar la lista de clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client);
    if (client) {
      form.setValues({
        name: client.name,
        contactPerson: client.contactPerson || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        priceModifier: client.priceModifier,
      });
    } else {
      form.reset();
    }
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingClient) {
        await apiClient.patch(`/clients/${editingClient.id}`, values);
      } else {
        await apiClient.post('/clients', values);
      }
      await fetchClients();
      closeModal();
    } catch (err: any) {
      form.setErrors({ name: err.response?.data?.message || 'Error al guardar el cliente' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente? Se borrarán también todas sus piscinas asociadas.')) {
      try {
        await apiClient.delete(`/clients/${id}`);
        setClients((current) => current.filter((c) => c.id !== id));
      } catch (err) {
        console.error('Failed to delete client', err);
      }
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const rows = clients.map((client) => (
    <Table.Tr key={client.id}>
      <Table.Td>
        <Anchor component={Link} to={`/clients/${client.id}`}>
          {client.name}
        </Anchor>
      </Table.Td>
      <Table.Td>{client.contactPerson || '-'}</Table.Td>
      <Table.Td>{client.phone || '-'}</Table.Td>
      <Table.Td>{client.email || '-'}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button variant="subtle" size="xs" onClick={() => handleOpenModal(client)}>Editar</Button>
          <Button variant="subtle" size="xs" color="red" onClick={() => handleDelete(client.id)}>Eliminar</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingClient ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Nombre del Cliente" {...form.getInputProps('name')} />
            <TextInput label="Persona de Contacto" {...form.getInputProps('contactPerson')} />
            <TextInput label="Email" type="email" {...form.getInputProps('email')} />
            <TextInput label="Teléfono" {...form.getInputProps('phone')} />
            <TextInput label="Dirección" {...form.getInputProps('address')} />
            <NumberInput 
              label="Modificador de Precio" 
              description="1.0 es normal, 0.9 es 10% dto, 1.1 es 10% recargo." 
              defaultValue={1.0} 
              step={0.05} 
              min={0} 
              decimalScale={2} 
              {...form.getInputProps('priceModifier')} 
            />
            <Button type="submit" mt="md">{editingClient ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Gestión de Clientes</Title>
          <Button onClick={() => handleOpenModal()}>Crear Nuevo Cliente</Button>
        </Group>
        <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Contacto</Table.Th>
              <Table.Th>Teléfono</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}>No hay clientes creados.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}