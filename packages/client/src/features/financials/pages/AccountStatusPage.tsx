// filename: packages/client/src/features/financials/pages/AccountStatusPage.tsx
// version: 2.1.3 (FIX: Use valid HTML table structure for expandable rows)
// description: Se reconstruye la tabla expandible utilizando un par de <tr> y el componente <Collapse> para respetar la estructura HTML. Esto soluciona los errores de 'validateDOMNesting' y la desalineación visual.

import { useState, useEffect, Fragment } from 'react';
import { Container, Title, Table, Loader, Alert, Paper, Group, Text, Stack, Divider, Box, ActionIcon, Collapse } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { MonthPickerInput } from '@mantine/dates';
import { format } from 'date-fns';
import 'dayjs/locale/es';
import apiClient from '../../../api/apiClient';

// --- Tipos de Datos (sin cambios) ---
interface BillingMaterial {
    productName: string;
    quantity: number;
    salePrice: number;
    total: number;
}
interface PaymentDetail {
    id: string;
    amount: number;
    paymentDate: string;
    method: string;
    notes: string | null;
}
interface AccountStatus {
  clientId: string;
  clientName: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  billingDetails: {
      monthlyFee: number;
      materials: BillingMaterial[];
      materialsSubtotal: number;
  };
  paymentDetails: PaymentDetail[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

// --- Sub-componentes para el Desglose (sin cambios) ---
const BillingDetails = ({ details }: { details: AccountStatus['billingDetails'] }) => (
    <Box mb="md">
        <Title order={5} mb="sm">Desglose de Facturación (Debe)</Title>
        <Stack gap="xs">
            <Group justify="space-between">
                <Text>Cuota de Mantenimiento Fija</Text>
                <Text fw={500}>{formatCurrency(details.monthlyFee)}</Text>
            </Group>
            {details.materials.length > 0 && (
                <>
                    <Divider label="Materiales y Consumos" />
                    {details.materials.map(mat => (
                         <Group key={mat.productName} justify="space-between">
                            <Text c="dimmed" size="sm">{mat.productName} ({mat.quantity} x {formatCurrency(mat.salePrice)})</Text>
                            <Text c="dimmed" size="sm">{formatCurrency(mat.total)}</Text>
                        </Group>
                    ))}
                     <Group justify="space-between" mt="xs">
                        <Text fw={500}>Subtotal Materiales</Text>
                        <Text fw={500}>{formatCurrency(details.materialsSubtotal)}</Text>
                    </Group>
                </>
            )}
        </Stack>
    </Box>
);

const PaymentDetails = ({ details }: { details: AccountStatus['paymentDetails'] }) => (
     <Box>
        <Title order={5} mb="sm">Desglose de Pagos (Haber)</Title>
        {details.length > 0 ? (
            <Table withColumnBorders withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Fecha</Table.Th>
                        <Table.Th>Importe</Table.Th>
                        <Table.Th>Método</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {details.map(p => (
                        <Table.Tr key={p.id}>
                            <Table.Td>{format(new Date(p.paymentDate), 'dd/MM/yyyy')}</Table.Td>
                            <Table.Td>{formatCurrency(p.amount)}</Table.Td>
                            <Table.Td>{p.method}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        ) : (
            <Text c="dimmed" size="sm">No se han registrado pagos para este cliente en este período.</Text>
        )}
    </Box>
);

// --- Componente Principal ---
export function AccountStatusPage() {
  const [data, setData] = useState<AccountStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [openedRow, setOpenedRow] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setData([]);
      return;
    }
    const fetchAccountStatus = async () => {
      setIsLoading(true);
      setError(null);
      setOpenedRow(null); 
      try {
        const response = await apiClient.get('/financials/account-status', {
          params: { date: selectedDate.toISOString() },
        });
        setData(response.data.data);
      } catch (err) {
        setError('No se pudo cargar el estado de cuentas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccountStatus();
  }, [selectedDate]);

  return (
    <Container fluid>
      <Title order={2} my="lg">Estado de Cuentas por Cliente</Title>
      
      <Paper withBorder p="md" mb="xl">
        <Group>
          <MonthPickerInput
            label="Seleccione el Mes y Año"
            placeholder="Mes y Año"
            value={selectedDate}
            onChange={(dateValue) => {
              setSelectedDate(dateValue ? new Date(dateValue) : null);
            }}
            locale="es"
          />
        </Group>
      </Paper>

      {isLoading && <Loader />}
      {error && <Alert color="red" title="Error">{error}</Alert>}
      
      {!isLoading && !error && (
        <Table striped withColumnBorders>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th w={40}></Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Total Facturado (Debe)</Table.Th>
                    <Table.Th>Total Pagado (Haber)</Table.Th>
                    <Table.Th>Saldo</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data.length > 0 ? data.map(row => {
                    const isPending = row.balance < 0;
                    const isOpened = openedRow === row.clientId;
                    return (
                        <Fragment key={row.clientId}>
                            <Table.Tr style={{ backgroundColor: isPending ? 'var(--mantine-color-red-0)' : 'transparent' }}>
                                <Table.Td>
                                    <ActionIcon variant="transparent" onClick={() => setOpenedRow(isOpened ? null : row.clientId)}>
                                        {isOpened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                                    </ActionIcon>
                                </Table.Td>
                                <Table.Td>
                                    <Text fw={isPending ? 700 : 400}>{row.clientName}</Text>
                                </Table.Td>
                                <Table.Td>{formatCurrency(row.totalBilled)}</Table.Td>
                                <Table.Td>{formatCurrency(row.totalPaid)}</Table.Td>
                                <Table.Td>
                                    <Text c={isPending ? 'red' : 'green'} fw={700}>{formatCurrency(row.balance)}</Text>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td colSpan={5} p={0} style={{ border: 0, padding: 0 }}>
                                    <Collapse in={isOpened}>
                                        <Paper p="md" m="xs" withBorder bg="gray.0" radius="md">
                                            <BillingDetails details={row.billingDetails} />
                                            <Divider my="lg" />
                                            <PaymentDetails details={row.paymentDetails} />
                                        </Paper>
                                    </Collapse>
                                </Table.Td>
                            </Table.Tr>
                        </Fragment>
                    )
                }) : (
                    <Table.Tr><Table.Td colSpan={5}>No hay datos para el período seleccionado.</Table.Td></Table.Tr>
                )}
            </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}