import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Table,
  Loader,
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  TextInput,
  Stack,
  PasswordInput,
  Menu,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient.js';

// --- Tipos ---
type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAYMENT_PENDING' | 'INACTIVE';

interface Tenant {
  id: string;
  companyName: string;
  subdomain: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      companyName: '',
      subdomain: '',
      adminUser: {
        name: '',
        email: '',
        password: '',
      },
    },
    validate: {
      companyName: (value: string) => (value.length < 2 ? 'El nombre debe tener al menos 2 caracteres' : null),
      subdomain: (value: string) => (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? null : 'Subdominio inválido'),
      adminUser: {
        email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
        password: (value: string) => (value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : null),
      },
    },
  });

  const fetchTenants = async () => {
    if (tenants.length === 0) setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<Tenant[]>>('/tenants');
      setTenants(response.data.data);
    } catch (err) {
      setError('No se pudo obtener la lista de tenants.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTenant = async (values: typeof form.values) => {
    try {
      await apiClient.post<ApiResponse<Tenant>>('/tenants', values);
      await fetchTenants();
      closeModal();
      form.reset();
    } catch (err: any) {
      form.setErrors({ companyName: err.response?.data?.message || 'Error al crear el tenant' });
    }
  };

  const handleUpdateStatus = async (tenantId: string, status: SubscriptionStatus) => {
    try {
      setTenants((current) =>
        current.map((t) => (t.id === tenantId ? { ...t, subscriptionStatus: status } : t))
      );
      await apiClient.patch(`/tenants/${tenantId}/status`, { status });
    } catch (err) {
      console.error('Failed to update tenant status', err);
      await fetchTenants();
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (window.confirm('¿Estás seguro? Esta acción eliminará el tenant y todos sus datos (usuarios, clientes, piscinas, etc.) de forma irreversible.')) {
      try {
        await apiClient.delete(`/tenants/${tenantId}`);
        setTenants((current) => current.filter((t) => t.id !== tenantId));
      } catch (err) {
        console.error('Failed to delete tenant', err);
        // TODO: Mostrar notificación de error al usuario
      }
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const rows = tenants.map((tenant) => (
    <Table.Tr key={tenant.id}>
      <Table.Td>{tenant.companyName}</Table.Td>
      <Table.Td>{tenant.subdomain}.pool-control.pro</Table.Td>
      <Table.Td>
        <Badge
          color={
            {
              ACTIVE: 'green',
              TRIAL: 'blue',
              PAYMENT_PENDING: 'orange',
              INACTIVE: 'gray',
            }[tenant.subscriptionStatus]
          }
        >
          {tenant.subscriptionStatus}
        </Badge>
      </Table.Td>
      <Table.Td>{new Date(tenant.createdAt).toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="outline" size="xs">Acciones</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Cambiar estado</Menu.Label>
            <Menu.Item onClick={() => handleUpdateStatus(tenant.id, 'ACTIVE')}>Activar</Menu.Item>
            <Menu.Item onClick={() => handleUpdateStatus(tenant.id, 'TRIAL')}>Poner en Trial</Menu.Item>
            <Menu.Item onClick={() => handleUpdateStatus(tenant.id, 'PAYMENT_PENDING')}>Pago Pendiente</Menu.Item>
            <Menu.Item onClick={() => handleUpdateStatus(tenant.id, 'INACTIVE')}>Desactivar</Menu.Item>
            <Menu.Divider />
            <Menu.Label>Zona de Peligro</Menu.Label>
            <Menu.Item color="red" onClick={() => handleDeleteTenant(tenant.id)}>
              Eliminar Tenant
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title="Crear Nuevo Tenant" centered>
        <form onSubmit={form.onSubmit(handleCreateTenant)}>
          <Stack>
            <TextInput required label="Nombre de la Empresa" placeholder="Ej. Piscinas Martínez" {...form.getInputProps('companyName')} />
            <TextInput required label="Subdominio" placeholder="ej. martinez" {...form.getInputProps('subdomain')} />
            <Title order={4} mt="md">Usuario Administrador</Title>
            <TextInput required label="Nombre del Admin" placeholder="Ej. Juan Martínez" {...form.getInputProps('adminUser.name')} />
            <TextInput required label="Email del Admin" placeholder="ej. juan@piscinasmartinez.com" {...form.getInputProps('adminUser.email')} />
            <PasswordInput required label="Contraseña del Admin" {...form.getInputProps('adminUser.password')} />
            <Button type="submit" mt="md">Crear Tenant</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Gestión de Tenants</Title>
          <Button onClick={openModal}>Crear Nuevo Tenant</Button>
        </Group>
        <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Empresa</Table.Th>
              <Table.Th>Subdominio</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Fecha de Creación</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}>No hay tenants creados.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}