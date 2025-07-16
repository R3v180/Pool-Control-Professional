// filename: packages/client/src/features/financials/pages/AccountStatusPage.tsx
// version: 3.0.2 (FIX: Correct date type handling and imports)
// description: Se corrigen los errores de tipo asegurando que las fechas sean objetos Date antes de su uso y utilizando importaciones de solo tipo.

import { useState, useEffect, Fragment, useMemo } from 'react';
import { Container, Title, Table, Loader, Alert, Paper, Group, Text, Stack, Divider, Box, ActionIcon, Collapse, Button, Card, SimpleGrid } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
// ✅ 1. Separar la importación del tipo
import { DatePickerInput } from '@mantine/dates';
import type { DatesRangeValue } from '@mantine/dates';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import 'dayjs/locale/es';
import apiClient from '../../../api/apiClient';

// --- Tipos de Datos (sin cambios) ---
interface BillingMaterial { productName: string; quantity: number; salePrice: number; total: number; }
interface PaymentDetail { id: string; amount: number; paymentDate: string; method: string; notes: string | null; }
interface AccountStatus {
  clientId: string;
  clientName: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  billingDetails: { monthlyFee: number; materials: BillingMaterial[]; materialsSubtotal: number; };
  paymentDetails: PaymentDetail[];
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

// --- Sub-componentes (sin cambios) ---
const BillingDetails = ({ details }: { details: AccountStatus['billingDetails'] }) => ( <Box mb="md"> <Title order={5} mb="sm">Desglose de Facturación (Debe)</Title> <Stack gap="xs"> <Group justify="space-between"> <Text>Cuotas de Mantenimiento</Text> <Text fw={500}>{formatCurrency(details.monthlyFee)}</Text> </Group> {details.materials.length > 0 && ( <> <Divider label="Materiales y Consumos" /> {details.materials.map(mat => ( <Group key={mat.productName} justify="space-between"> <Text c="dimmed" size="sm">{mat.productName} ({mat.quantity} x {formatCurrency(mat.salePrice)})</Text> <Text c="dimmed" size="sm">{formatCurrency(mat.total)}</Text> </Group> ))} <Group justify="space-between" mt="xs"> <Text fw={500}>Subtotal Materiales</Text> <Text fw={500}>{formatCurrency(details.materialsSubtotal)}</Text> </Group> </> )} </Stack> </Box> );
const PaymentDetails = ({ details }: { details: AccountStatus['paymentDetails'] }) => ( <Box> <Title order={5} mb="sm">Desglose de Pagos (Haber)</Title> {details.length > 0 ? ( <Table withColumnBorders withTableBorder> <Table.Thead> <Table.Tr><Table.Th>Fecha</Table.Th><Table.Th>Importe</Table.Th><Table.Th>Método</Table.Th></Table.Tr> </Table.Thead> <Table.Tbody> {details.map(p => ( <Table.Tr key={p.id}><Table.Td>{format(new Date(p.paymentDate), 'dd/MM/yyyy')}</Table.Td><Table.Td>{formatCurrency(p.amount)}</Table.Td><Table.Td>{p.method}</Table.Td></Table.Tr> ))} </Table.Tbody> </Table> ) : ( <Text c="dimmed" size="sm">No se han registrado pagos para este cliente en este período.</Text> )} </Box> );

// --- Componente Principal ---
export function AccountStatusPage() {
  const [rawData, setRawData] = useState<AccountStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState<DatesRangeValue>([startOfYear(new Date()), endOfYear(new Date())]);
  const [openedRow, setOpenedRow] = useState<string | null>(null);

  useEffect(() => {
    const [start, end] = dateRange;
    if (!start || !end) {
      setRawData([]);
      return;
    }
    const fetchAccountStatus = async () => {
      setIsLoading(true);
      setError(null);
      setOpenedRow(null); 
      try {
        // ✅ 2. Asegurarse de que son objetos Date antes de usar .toISOString()
        const startDate = new Date(start);
        const endDate = new Date(end);

        const response = await apiClient.get('/financials/account-status', {
          params: { 
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
           },
        });
        setRawData(response.data.data);
      } catch (err) {
        setError('No se pudo cargar el estado de cuentas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccountStatus();
  }, [dateRange]);

  const summary = useMemo(() => {
    const totalPending = rawData.reduce((acc, row) => (row.balance < 0 ? acc + row.balance : acc), 0);
    const clientsInDebt = rawData.filter(row => row.balance < 0).length;
    return { totalPending, clientsInDebt };
  }, [rawData]);

  return (
    <Container fluid>
      <Title order={2} my="lg">Centro de Control de Cobros</Title>
      
      <Paper withBorder p="md" mb="xl">
        <Group align="flex-end">
          <DatePickerInput
            type="range"
            label="Seleccione el Período"
            placeholder="Inicio - Fin"
            value={dateRange}
            onChange={setDateRange}
            locale="es"
            w={280}
          />
          <Button.Group>
              <Button variant="default" onClick={() => setDateRange([startOfMonth(new Date()), endOfMonth(new Date())])}>Este Mes</Button>
              <Button variant="default" onClick={() => {
                  const lastMonth = subMonths(new Date(), 1);
                  setDateRange([startOfMonth(lastMonth), endOfMonth(lastMonth)]);
              }}>Mes Pasado</Button>
              <Button variant="default" onClick={() => setDateRange([startOfYear(new Date()), endOfYear(new Date())])}>Este Año</Button>
          </Button.Group>
        </Group>
      </Paper>
      
      {!isLoading && !error && (
        <SimpleGrid cols={2} mb="xl">
            <Card withBorder shadow="sm">
                <Text>Saldo Pendiente Total</Text>
                <Text c="red" size="xl" fw={700}>{formatCurrency(summary.totalPending)}</Text>
            </Card>
            <Card withBorder shadow="sm">
                <Text>Nº de Clientes con Deuda</Text>
                <Text size="xl" fw={700}>{summary.clientsInDebt}</Text>
            </Card>
        </SimpleGrid>
      )}

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
                {rawData.length > 0 ? rawData.map(row => {
                    const isPending = row.balance < 0;
                    const isOpened = openedRow === row.clientId;
                    return (
                        <Fragment key={row.clientId}>
                            <Table.Tr style={{ backgroundColor: isPending ? '#fff5f5' : 'transparent', cursor: 'pointer' }} onClick={() => setOpenedRow(isOpened ? null : row.clientId)}>
                                <Table.Td>
                                    <ActionIcon variant="transparent" c="gray">
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