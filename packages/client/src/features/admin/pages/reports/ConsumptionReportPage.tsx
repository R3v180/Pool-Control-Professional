// filename: packages/client/src/features/admin/pages/reports/ConsumptionReportPage.tsx
// version: 2.2.2 (FIX: Definitively correct the string-to-date conversion on DatePickerInput's onChange)

import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, Paper, Group, Select, Button, Loader, Alert, Stack, Table, Text, Card, SimpleGrid, Collapse, Modal, Anchor } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import 'dayjs/locale/es';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '../../../../api/apiClient';
import { useDisclosure } from '@mantine/hooks';

// --- Tipos de Datos para el Frontend ---
interface Client {
  id: string;
  name: string;
}

interface DetailedConsumption {
  productId: string;
  productName: string;
  unit: string;
  totalQuantity: number;
  totalCost: number;
}

interface ProductConsumptionDetail {
    visitId: string;
    visitDate: Date;
    quantity: number;
    cost: number;
    technicianName: string | null;
}

type DateRange = [Date | null, Date | null];

interface ReportData {
  summary: {
    totalCost: number;
    totalVisits: number;
  };
  byClient: {
    clientId: string;
    clientName: string;
    totalClientCost: number;
    visitCount: number;
    detailedConsumption: DetailedConsumption[];
  }[];
}

export function ConsumptionReportPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>([startOfMonth(new Date()), endOfMonth(new Date())]);
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openedRow, setOpenedRow] = useState<string | null>(null);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [productDetailData, setProductDetailData] = useState<ProductConsumptionDetail[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedProductInfo, setSelectedProductInfo] = useState<{ productName: string, clientId: string } | null>(null);


  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/clients');
        setClients(response.data.data);
      } catch (err) {
        setError('No se pudo cargar la lista de clientes.');
      }
    };
    fetchClients();
  }, []);

  const handleGenerateReport = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      setError('Por favor, seleccione un rango de fechas completo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReportData(null);
    setOpenedRow(null);

    try {
      const params = new URLSearchParams({
        startDate: startOfDay(dateRange[0]).toISOString(),
        endDate: endOfDay(dateRange[1]).toISOString(),
      });
      if (selectedClientId) {
        params.append('clientId', selectedClientId);
      }
      
      const response = await apiClient.get(`/reports/consumption?${params.toString()}`);
      setReportData(response.data.data);
    } catch (err) {
      setError('Ocurrió un error al generar el informe.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProductDrillDown = async (clientId: string, product: DetailedConsumption) => {
    if (!dateRange[0] || !dateRange[1]) return;

    setSelectedProductInfo({ productName: product.productName, clientId });
    setIsDetailLoading(true);
    openDetailModal();
    setProductDetailData([]);

    try {
        const params = new URLSearchParams({
            startDate: startOfDay(dateRange[0]).toISOString(),
            endDate: endOfDay(dateRange[1]).toISOString(),
            clientId: clientId,
            productId: product.productId,
        });

        const response = await apiClient.get(`/reports/consumption/details?${params.toString()}`);
        setProductDetailData(response.data.data);
    } catch (err) {
        console.error("Error al cargar el detalle del producto", err);
    } finally {
        setIsDetailLoading(false);
    }
  }


  const handleExportToCSV = () => {
    if (!reportData) return;
  
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Cliente,Nombre Cliente,Coste Total Cliente,Producto,Cantidad Consumida,Unidad,Coste Producto\r\n";
  
    reportData.byClient.forEach(client => {
      if (client.detailedConsumption.length === 0) {
        csvContent += `${client.clientId},"${client.clientName.replace(/"/g, '""')}",${client.totalClientCost.toFixed(2)},N/A,0,N/A,0\r\n`;
      } else {
        client.detailedConsumption.forEach(item => {
          csvContent += [
            client.clientId,
            `"${client.clientName.replace(/"/g, '""')}"`,
            client.totalClientCost.toFixed(2),
            `"${item.productName.replace(/"/g, '""')}"`,
            item.totalQuantity,
            item.unit,
            item.totalCost.toFixed(2)
          ].join(',') + '\r\n';
        });
      }
    });
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `informe_consumo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.name,
  }));

  const reportRows = reportData?.byClient.map((client) => {
    const isOpened = openedRow === client.clientId;
    return (
      <Fragment key={client.clientId}>
        <Table.Tr 
          onClick={() => setOpenedRow(isOpened ? null : client.clientId)}
          style={{ cursor: 'pointer', backgroundColor: isOpened ? 'var(--mantine-color-blue-0)' : 'transparent' }}
        >
          <Table.Td>{client.clientName}</Table.Td>
          <Table.Td>{client.visitCount}</Table.Td>
          <Table.Td>{client.totalClientCost.toFixed(2)} €</Table.Td>
        </Table.Tr>
        
        <Table.Tr>
          <Table.Td colSpan={3} p={0} style={{ border: 0 }}>
            <Collapse in={isOpened}>
              <Paper p="md" m="xs" withBorder bg="gray.0">
                <Text fw={700} mb="sm">Desglose de Productos para {client.clientName}</Text>
                <Table withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Producto</Table.Th>
                      <Table.Th>Cantidad Total</Table.Th>
                      <Table.Th>Coste</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {client.detailedConsumption.map(item => (
                      <Table.Tr key={item.productName}>
                        <Table.Td>
                            <Anchor component="button" type="button" onClick={() => handleProductDrillDown(client.clientId, item)}>
                                {item.productName}
                            </Anchor>
                        </Table.Td>
                        <Table.Td>{item.totalQuantity.toFixed(2)} {item.unit}</Table.Td>
                        <Table.Td>{item.totalCost.toFixed(2)} €</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Collapse>
          </Table.Td>
        </Table.Tr>
      </Fragment>
    );
  });

  return (
    <Container fluid>
      <Modal 
        opened={detailModalOpened} 
        onClose={closeDetailModal} 
        title={`Detalle de consumo para: ${selectedProductInfo?.productName || ''}`}
        size="xl"
        centered
      >
        {isDetailLoading ? <Loader /> : (
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Fecha de Visita</Table.Th>
                        <Table.Th>Técnico</Table.Th>
                        <Table.Th>Cantidad</Table.Th>
                        <Table.Th>Coste</Table.Th>
                        <Table.Th>Acciones</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {productDetailData.map(detail => (
                        <Table.Tr key={detail.visitId}>
                            <Table.Td>{format(new Date(detail.visitDate), 'd MMMM yyyy, HH:mm', { locale: es })}</Table.Td>
                            <Table.Td>{detail.technicianName}</Table.Td>
                            <Table.Td>{detail.quantity.toFixed(2)}</Table.Td>
                            <Table.Td>{detail.cost.toFixed(2)} €</Table.Td>
                            <Table.Td>
                                <Button component={Link} to={`/visits/${detail.visitId}`} size="xs" variant="outline">
                                    Ver Parte
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        )}
      </Modal>

      <Title order={2} mb="xl">Informe de Consumos y Costes</Title>
      
      <Paper withBorder shadow="sm" p="md" mb="xl">
        <Group align="flex-end">
          <DatePickerInput
            type="range"
            label="Periodo del Informe"
            placeholder="Seleccione un rango de fechas"
            value={dateRange}
            // ✅ SOLUCIÓN FINAL Y DEFINITIVA
            onChange={(value: [string | null, string | null]) => {
              const [start, end] = value;
              setDateRange([start ? new Date(start) : null, end ? new Date(end) : null]);
            }}
            locale="es"
            valueFormat="D MMMM, YYYY"
            style={{ flex: 1 }}
          />
          
          <Select
            label="Cliente"
            placeholder="Todos los clientes"
            data={clientOptions}
            value={selectedClientId}
            onChange={setSelectedClientId}
            clearable
            style={{ width: '250px' }}
          />
          
          <Button onClick={handleGenerateReport} loading={isLoading}>
            Generar Informe
          </Button>
          {reportData && (
             <Button
                variant="outline"
                onClick={handleExportToCSV}
                disabled={!reportData || reportData.byClient.length === 0}
            >
                Exportar a CSV
            </Button>
          )}
        </Group>
      </Paper>
      
      {isLoading && <Loader size="xl" />}
      {error && <Alert color="red" title="Error">{error}</Alert>}
      
      {reportData && (
        <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Card withBorder shadow="sm" p="md">
                    <Text size="lg" fw={700}>Coste Total del Periodo</Text>
                    <Text size="xl" c="blue">{reportData.summary.totalCost.toFixed(2)} €</Text>
                </Card>
                <Card withBorder shadow="sm" p="md">
                    <Text size="lg" fw={700}>Nº de Visitas Registradas</Text>
                    <Text size="xl" c="blue">{reportData.summary.totalVisits}</Text>
                </Card>
            </SimpleGrid>

            <Title order={4} mt="xl">Resumen por Cliente</Title>
            <Table striped withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Cliente</Table.Th>
                        <Table.Th>Nº de Visitas</Table.Th>
                        <Table.Th>Coste Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {reportRows?.length ? reportRows : <Table.Tr><Table.Td colSpan={3}>No se encontraron datos para los filtros seleccionados.</Table.Td></Table.Tr>}
                </Table.Tbody>
            </Table>
        </Stack>
      )}
    </Container>
  );
}