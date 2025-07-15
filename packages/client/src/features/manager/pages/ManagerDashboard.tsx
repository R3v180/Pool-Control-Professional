// ====== [25] packages/client/src/features/manager/pages/ManagerDashboard.tsx ======
// filename: packages/client/src/features/manager/pages/ManagerDashboard.tsx
// version: 2.4.0 (FEAT: Add Team Performance widget)
// description: Added a new widget to the dashboard to display team performance metrics with a bar chart comparing technicians.

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Title, Grid, Paper, Text, Loader, Alert, Center, RingProgress, Stack, Group, Anchor, Badge } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { DatesRangeValue } from '@mantine/dates';
import 'dayjs/locale/es';
import { subDays, endOfDay } from 'date-fns';

import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  type ChartEvent,
  type ActiveElement,
  type TooltipItem
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import apiClient from '../../../api/apiClient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  financials: { totalRevenue: number; totalCosts: number; netProfit: number; };
  incidents: { openIncidents: number; resolvedThisMonth: number; avgResolutionTimeHours: number | null; };
  topClientsByProfit: { 
    clientId: string; 
    clientName: string; 
    netProfit: number;
    totalRevenue: number;
    totalCosts: number;
  }[];
  topProductsByCost: { productId: string; productName: string; totalCost: number; }[];
  // ✅ 1. Actualizar la interfaz para incluir los nuevos datos
  teamPerformance: {
    technicianId: string;
    technicianName: string;
    completedVisits: number;
    completedTasks: number;
  }[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export function ManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<DatesRangeValue>([
    subDays(new Date(), 30),
    endOfDay(new Date()),
  ]);
  
  useEffect(() => {
    const fetchData = async () => {
      const [startDateValue, endDateValue] = dateRange;
      if (!startDateValue || !endDateValue) return;

      setIsLoading(true);
      try {
        const startDate = new Date(startDateValue);
        const endDate = new Date(endDateValue);
        
        const response = await apiClient.get<{ success: boolean; data: DashboardData }>('/dashboard/manager', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        });
        setData(response.data.data);
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  if (isLoading) return <Center style={{ height: '100%' }}><Loader size="xl" /></Center>;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!data) return <Alert color="yellow">No hay datos disponibles para mostrar.</Alert>;
  
  const profitMargin = data.financials.totalRevenue > 0 ? (data.financials.netProfit / data.financials.totalRevenue) * 100 : 0;
  
  const handleProductChartClick = (_event: ChartEvent, elements: ActiveElement[]) => {
    const element = elements[0];
    if (element && data) {
      const elementIndex = element.index;
      const product = data.topProductsByCost[elementIndex];
      if (product) {
        navigate(`/reports/consumption?productId=${product.productId}`);
      }
    }
  };


  const topProductsChartData: ChartData<'doughnut'> = {
    labels: data.topProductsByCost.map(p => p.productName),
    datasets: [{
      label: 'Coste Total',
      data: data.topProductsByCost.map(p => p.totalCost),
      backgroundColor: ['rgba(255, 99, 132, 0.5)','rgba(54, 162, 235, 0.5)','rgba(255, 206, 86, 0.5)','rgba(75, 192, 192, 0.5)','rgba(153, 102, 255, 0.5)'],
    }]
  };
  
  const topProductsChartOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false, onClick: handleProductChartClick,
    plugins: { legend: { position: 'right' } }
  };

  const topClientsChartData: ChartData<'bar'> = {
    labels: data.topClientsByProfit.map(c => c.clientName),
    datasets: [{
      label: 'Beneficio Neto',
      data: data.topClientsByProfit.map(c => c.netProfit),
      backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1,
    }]
  };

  const topClientsChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    onClick: (_, elements) => {
        const element = elements[0];
        if (element && data?.topClientsByProfit) {
            const client = data.topClientsByProfit[element.index];
            if (client) navigate(`/clients/${client.clientId}`);
        }
    },
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'Beneficio Neto en el Periodo' },
        tooltip: {
          callbacks: {
            label: function(context: TooltipItem<'bar'>) {
              const clientData = data.topClientsByProfit[context.dataIndex];
              if (!clientData) return '';
              const margin = clientData.totalRevenue > 0 ? (clientData.netProfit / clientData.totalRevenue) * 100 : 0;
              return [
                `Beneficio: ${formatCurrency(clientData.netProfit)}`,
                `  Ingresos: ${formatCurrency(clientData.totalRevenue)}`,
                `  Costes: ${formatCurrency(clientData.totalCosts)}`,
                `  Margen: ${margin.toFixed(1)}%`
              ];
            }
          }
        }
    }
  };

  // ✅ 2. Definir datos y opciones para el nuevo gráfico
  const teamPerformanceChartData: ChartData<'bar'> = {
    labels: data.teamPerformance.map(t => t.technicianName),
    datasets: [
      {
        label: 'Visitas Completadas',
        data: data.teamPerformance.map(t => t.completedVisits),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Tareas Resueltas',
        data: data.teamPerformance.map(t => t.completedTasks),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      }
    ]
  };

  const teamPerformanceChartOptions: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    onClick: (_, elements) => {
        const element = elements[0];
        if (element && data?.teamPerformance) {
            const tech = data.teamPerformance[element.index];
            if (tech) {
              // TODO: Navegar a una futura página de detalle de técnico
              console.log("Clicked on technician:", tech.technicianId);
            }
        }
    },
    plugins: {
      title: { display: true, text: 'Productividad por Técnico en el Periodo' }
    }
  };

  return (
    <Container fluid>
      <Title order={2} mb="xl">Dashboard de Gerencia</Title>
      
      <Paper withBorder p="md" shadow="sm" mb="xl">
        <DatePickerInput
          type="range" label="Seleccione el Periodo de Análisis" placeholder="Inicio - Fin"
          value={dateRange} onChange={setDateRange} locale="es" maw={400}
        />
      </Paper>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Anchor component={Link} to="/reports/invoicing" underline="never">
            <Paper withBorder p="md" shadow="sm" h="100%">
              <Title order={4} mb="md">Salud Financiera (Periodo)</Title>
              <Group justify="space-around" align="center">
                  <RingProgress size={140} thickness={14} roundCaps
                      label={<Text c="blue" fw={700} ta="center" size="xl">{profitMargin.toFixed(1)}%</Text>}
                      sections={[{ value: profitMargin, color: 'blue' }]} />
                  <Stack gap="xs">
                      <Text>Ingresos: {formatCurrency(data.financials.totalRevenue)}</Text>
                      <Text>Costes: {formatCurrency(data.financials.totalCosts)}</Text>
                      <Text fw={700}>Beneficio: {formatCurrency(data.financials.netProfit)}</Text>
                  </Stack>
              </Group>
            </Paper>
          </Anchor>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Paper withBorder p="md" shadow="sm" h="100%">
            <Title order={4} mb="md">Estado de Incidencias</Title>
            <Group justify="space-around" align="flex-end" h="80%">
                <Anchor component={Link} to="/incidents-history?status=PENDING" underline="never">
                  <Stack align="center" gap={0} style={{ cursor: 'pointer' }}>
                      <Text size="3rem" fw={700} c="orange">{data.incidents.openIncidents}</Text>
                      <Badge color="orange" variant="light" size="lg">Abiertas (Total)</Badge>
                  </Stack>
                </Anchor>
                <Stack align="center" gap={0}>
                    <Text size="3rem" fw={700} c="green">{data.incidents.resolvedThisMonth}</Text>
                    <Text c="dimmed">Resueltas (Periodo)</Text>
                </Stack>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" shadow="sm" h="100%">
            <Title order={4} mb="md">Top 5 Productos por Coste (Periodo)</Title>
            <Center style={{maxHeight: 250}}>
                <Doughnut data={topProductsChartData} options={topProductsChartOptions} />
            </Center>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="md" shadow="sm" h="100%">
            <Title order={4} mb="md">Top 5 Clientes por Rentabilidad (Periodo)</Title>
            <div style={{ height: '300px' }}>
                <Bar data={topClientsChartData} options={topClientsChartOptions} />
            </div>
          </Paper>
        </Grid.Col>
        
        {/* ✅ 3. Añadir el nuevo widget al layout */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" shadow="sm" h="100%">
             <Title order={4} mb="md">Rendimiento del Equipo</Title>
             <div style={{ height: '300px' }}>
                <Bar data={teamPerformanceChartData} options={teamPerformanceChartOptions} />
            </div>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}