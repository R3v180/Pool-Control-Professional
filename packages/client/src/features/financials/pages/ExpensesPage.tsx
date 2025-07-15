// filename: packages/client/src/features/financials/pages/ExpensesPage.tsx
// version: 1.0.0
// description: Página para visualizar y registrar los gastos generales de la empresa.

import { useEffect, useState } from 'react';
import { Container, Title, Table, Loader, Alert, Button, Group, Modal, NumberInput, Stack, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient';
import { format } from 'date-fns';

// --- Tipos de Datos ---
interface Expense {
  id: string;
  amount: number;
  expenseDate: string;
  description: string;
  category: string;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente Principal ---
export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      amount: 0,
      expenseDate: new Date(),
      description: '',
      category: '',
    },
    validate: {
      amount: (value) => value <= 0 ? 'El importe debe ser mayor que cero' : null,
      expenseDate: (value) => !value ? 'La fecha es obligatoria' : null,
      description: (value) => value.trim().length === 0 ? 'La descripción es obligatoria' : null,
      category: (value) => value.trim().length === 0 ? 'La categoría es obligatoria' : null,
    },
  });

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<Expense[]>>('/expenses');
      setExpenses(response.data.data);
    } catch (err) {
      setError('No se pudo cargar la lista de gastos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await apiClient.post('/expenses', values);
      await fetchExpenses();
      closeModal();
      form.reset();
    } catch (err: any) {
      form.setErrors({ description: err.response?.data?.message || 'Error al registrar el gasto.' });
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        await apiClient.delete(`/expenses/${expenseId}`);
        setExpenses((current) => current.filter((e) => e.id !== expenseId));
      } catch (err) {
        alert('No se pudo eliminar el gasto.');
      }
    }
  };

  const rows = expenses.map((expense) => (
    <Table.Tr key={expense.id}>
      <Table.Td>{format(new Date(expense.expenseDate), 'dd/MM/yyyy')}</Table.Td>
      <Table.Td>{expense.description}</Table.Td>
      <Table.Td>{expense.category}</Table.Td>
      <Table.Td>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.amount)}</Table.Td>
      <Table.Td>
        <Button variant="subtle" color="red" size="xs" onClick={() => handleDelete(expense.id)}>Eliminar</Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title="Registrar Nuevo Gasto" centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <DatePickerInput label="Fecha del Gasto" required {...form.getInputProps('expenseDate')} />
            <TextInput label="Descripción" placeholder="Ej: Compra de material de oficina" required {...form.getInputProps('description')} />
            <TextInput label="Categoría" placeholder="Ej: Combustible, Nóminas, Suministros" required {...form.getInputProps('category')} />
            <NumberInput label="Importe (€)" decimalScale={2} fixedDecimalScale required {...form.getInputProps('amount')} />
            <Button type="submit" mt="md">Registrar Gasto</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Gestión de Gastos Generales</Title>
          <Button onClick={openModal}>Registrar Nuevo Gasto</Button>
        </Group>
        
        {isLoading && <Loader />}
        {error && <Alert color="red" title="Error">{error}</Alert>}
        
        <Table striped withTableBorder mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>Categoría</Table.Th>
              <Table.Th>Importe</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expenses.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}>No hay gastos registrados.</Table.Td></Table.Tr>}
          </Table.Tbody>
        </Table>
      </Container>
    </>
  );
}