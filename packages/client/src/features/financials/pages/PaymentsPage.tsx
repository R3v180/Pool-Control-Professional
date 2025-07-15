// filename: packages/client/src/features/financials/pages/PaymentsPage.tsx
// version: 1.0.1 (FIXED)
// description: Corrige importaciones y variables no utilizadas.

import { useEffect, useState } from 'react';
import { Container, Title, Table, Loader, Alert, Button, Group, Modal, Select, NumberInput, Stack, TextInput, Textarea, Paper } from '@mantine/core'; // ✅ Paper añadido
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient';
import { format } from 'date-fns';

// --- Tipos de Datos ---
interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  method: string;
  notes: string | null;
  client: { name: string };
}
interface Client {
  id: string;
  name: string;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente Principal ---
export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      clientId: '',
      amount: 0,
      paymentDate: new Date(),
      method: 'Transferencia Bancaria',
      notes: '',
    },
    validate: {
      clientId: (value) => !value ? 'Debe seleccionar un cliente' : null,
      amount: (value) => value <= 0 ? 'El importe debe ser mayor que cero' : null,
      paymentDate: (value) => !value ? 'La fecha es obligatoria' : null,
      method: (value) => value.trim().length === 0 ? 'El método es obligatorio' : null,
    },
  });

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // ✅ Se elimina la variable 'url' no utilizada.
      const clientsRes = await apiClient.get<ApiResponse<Client[]>>('/clients');
      setClients(clientsRes.data.data);
      setPayments([]);
    } catch (err) {
      setError('No se pudo cargar la lista de clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentsForClient = async (clientId: string | null) => {
    if (!clientId) {
        setPayments([]);
        return;
    }
    setIsLoading(true);
    try {
        const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/by-client/${clientId}`);
        setPayments(response.data.data);
    } catch (err) {
        setError(`No se pudieron cargar los pagos para este cliente.`);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPaymentsForClient(selectedClient);
  }, [selectedClient]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await apiClient.post('/payments', values);
      // Si el pago es para el cliente actualmente seleccionado, refrescamos la lista
      if (values.clientId === selectedClient) {
        await fetchPaymentsForClient(values.clientId);
      }
      closeModal();
      form.reset();
    } catch (err: any) {
      form.setErrors({ clientId: err.response?.data?.message || 'Error al registrar el pago.' });
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      try {
        await apiClient.delete(`/payments/${paymentId}`);
        await fetchPaymentsForClient(selectedClient);
      } catch (err) {
        alert('No se pudo eliminar el pago.');
      }
    }
  };

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));

  const rows = payments.map((payment) => (
    <Table.Tr key={payment.id}>
      <Table.Td>{format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</Table.Td>
      {/* No necesitamos mostrar el cliente en la tabla si ya está filtrado
      <Table.Td>{payment.client.name}</Table.Td> 
      */}
      <Table.Td>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(payment.amount)}</Table.Td>
      <Table.Td>{payment.method}</Table.Td>
      <Table.Td>{payment.notes || '-'}</Table.Td>
      <Table.Td>
        <Button variant="subtle" color="red" size="xs" onClick={() => handleDelete(payment.id)}>Eliminar</Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title="Registrar Nuevo Pago" centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Select label="Cliente" placeholder="Seleccione un cliente" data={clientOptions} required {...form.getInputProps('clientId')} />
            <NumberInput label="Importe (€)" decimalScale={2} fixedDecimalScale required {...form.getInputProps('amount')} />
            <DatePickerInput label="Fecha de Pago" required {...form.getInputProps('paymentDate')} />
            <TextInput label="Método de Pago" placeholder="Ej: Transferencia, Efectivo..." required {...form.getInputProps('method')} />
            <Textarea label="Notas (Opcional)" placeholder="Ej: Factura 2025-0045" {...form.getInputProps('notes')} />
            <Button type="submit" mt="md">Registrar Pago</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Gestión de Pagos Recibidos</Title>
          <Button onClick={openModal}>Registrar Nuevo Pago</Button>
        </Group>
        
        <Paper withBorder p="md" mb="xl">
            <Select 
                label="Filtrar por Cliente"
                placeholder="Seleccione un cliente para ver sus pagos"
                data={clientOptions}
                value={selectedClient}
                onChange={setSelectedClient}
                clearable
            />
        </Paper>

        {isLoading && <Loader />}
        {error && <Alert color="red" title="Error">{error}</Alert>}
        
        <Table striped withTableBorder mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fecha</Table.Th>
              {/* <Table.Th>Cliente</Table.Th> */}
              <Table.Th>Importe</Table.Th>
              <Table.Th>Método</Table.Th>
              <Table.Th>Notas</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payments.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}>Seleccione un cliente para ver sus pagos o registre uno nuevo.</Table.Td></Table.Tr>}
          </Table.Tbody>
        </Table>
      </Container>
    </>
  );
}