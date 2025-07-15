// filename: packages/client/src/features/manager/pages/InvoicingReportPage.tsx
// version: 1.0.3 (FIXED)
// description: Asegura que las fechas son objetos Date antes de usarlas.

import { useEffect, useState } from 'react';
import { Container, Title, Paper, Group, Button, Loader, Alert, Table, Accordion, Text, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { DatesRangeValue } from '@mantine/dates';
import 'dayjs/locale/es';
import apiClient from '../../../api/apiClient';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

// --- Tipos ---
interface BilledConsumption {
  productId: string;
  productName: string;
  unit: string;
  totalQuantity: number;
  salePrice: number;
  totalLine: number;
}
interface ClientInvoiceData {
  clientId: string;
  clientName: string;
  billingModel: string;
  monthlyFee: number;
  materialsSubtotal: number;
  totalToInvoice: number;
  billedConsumption: BilledConsumption[];
}
interface InvoicingReport {
  summary: {
    totalToInvoice: number;
    totalFees: number;
    totalMaterials: number;
  };
  byClient: ClientInvoiceData[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export function InvoicingReportPage() {
  const [report, setReport] = useState<InvoicingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DatesRangeValue>([
    startOfMonth(subMonths(new Date(), 1)),
    endOfMonth(subMonths(new Date(), 1)),
  ]);

  const fetchReport = async () => {
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) {
      setError('Por favor, seleccione un rango de fechas válido.');
      return;
    }
    
    // ✅ Conversión y validación segura de fechas
    const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
    const endDateObj = endDate instanceof Date ? endDate : new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      setError('Formato de fecha inválido.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await apiClient.get('/reports/invoicing', {
        params: {
          startDate: startDateObj.toISOString(),
          endDate: endDateObj.toISOString(),
        },
      });
      setReport(response.data.data);
    } catch (err) {
      setError('No se pudo generar el informe.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientRows = report?.byClient.map((clientData) => (
    <Accordion.Item key={clientData.clientId} value={clientData.clientId}>
      <Accordion.Control>
        <Group justify="space-between">
          <Text fw={500}>{clientData.clientName}</Text>
          <Text fw={700} c="blue">{formatCurrency(clientData.totalToInvoice)}</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="xs">
            <Text><strong>Modelo de Contrato:</strong> {clientData.billingModel.replace(/_/g, ' ').toLowerCase()}</Text>
            <Text><strong>Cuota Fija:</strong> {formatCurrency(clientData.monthlyFee)}</Text>
            <Text><strong>Subtotal Materiales:</strong> {formatCurrency(clientData.materialsSubtotal)}</Text>
        </Stack>
        {clientData.billedConsumption.length > 0 && (
            <Table mt="md" striped withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Producto</Table.Th>
                        <Table.Th>Cantidad</Table.Th>
                        <Table.Th>PVP Unitario</Table.Th>
                        <Table.Th>Total Línea</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {clientData.billedConsumption.map(item => (
                        <Table.Tr key={item.productId}>
                            <Table.Td>{item.productName}</Table.Td>
                            <Table.Td>{item.totalQuantity} {item.unit}</Table.Td>
                            <Table.Td>{formatCurrency(item.salePrice)}</Table.Td>
                            <Table.Td>{formatCurrency(item.totalLine)}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  ));


  return (
    <Container fluid>
      <Title order={2} mb="xl">Informe para Facturación</Title>
      <Paper withBorder p="md" mb="xl" shadow="sm">
        <Group>
          <DatePickerInput
            type="range"
            label="Seleccione el periodo"
            placeholder="Inicio - Fin"
            value={dateRange}
            onChange={setDateRange}
            locale="es"
            maw={400}
          />
          <Button onClick={fetchReport} loading={isLoading} mt="xl">
            Generar Informe
          </Button>
        </Group>
      </Paper>

      {isLoading && <Loader />}
      {error && <Alert color="red" title="Error">{error}</Alert>}
      
      {report && (
        <Paper withBorder p="md" shadow="sm">
            <Title order={4} mb="md">Resumen Total del Periodo</Title>
            <Group justify="space-around" mb="xl">
                <Stack align="center" gap={0}>
                    <Text size="xl" fw={500}>Cuotas Fijas</Text>
                    <Text size="2rem" fw={700} c="dimmed">{formatCurrency(report.summary.totalFees)}</Text>
                </Stack>
                <Stack align="center" gap={0}>
                    <Text size="xl" fw={500}>Materiales</Text>
                    <Text size="2rem" fw={700} c="dimmed">{formatCurrency(report.summary.totalMaterials)}</Text>
                </Stack>
                <Stack align="center" gap={0}>
                    <Text size="xl" fw={500}>Total a Facturar</Text>
                    <Text size="2.5rem" fw={700} c="blue">{formatCurrency(report.summary.totalToInvoice)}</Text>
                </Stack>
            </Group>
            <Title order={4} my="md">Desglose por Cliente</Title>
            <Accordion variant="separated">
                {clientRows}
            </Accordion>
        </Paper>
      )}
    </Container>
  );
}