// filename: packages/client/src/features/manager/pages/ManagerDashboard.tsx
// version: 1.1.6 (FEAT: Link financial widget to report page)
// description: Makes the financial widget clickable, navigating to the new invoicing report page.

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Title, Grid, Paper, Text, Loader, Alert, Center, RingProgress, Stack, Group, Anchor } from '@mantine/core';
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
  topClientsByProfit: { clientId: string; clientName: string; netProfit: number; }[];
  topProductsByCost: { productId: string; productName: string; totalCost: number; }[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export function ManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: DashboardData }>('/dashboard/manager');
        setData(response.data.data);
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <Center style={{ height: '100%' }}><Loader size="xl" /></Center>;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!data) return <Alert color="yellow">No hay datos disponibles para mostrar.</Alert>;
  
  const profitMargin = data.financials.totalRevenue > 0 ? (data.financials.netProfit / data.financials.totalRevenue) * 100 : 0;

  const topProductsChartData: ChartData<'doughnut'> = {
    labels: data.topProductsByCost.map(p => p.productName),
    datasets: [{
      label: 'Coste Total',
      data: data.topProductsByCost.map(p => p.totalCost),
      backgroundColor: ['rgba(255, 99, 132, 0.5)','rgba(54, 162, 235, 0.5)','rgba(255, 206, 86, 0.5)','rgba(75, 192, 192, 0.5)','rgba(153, 102, 255, 0.5)'],
    }]
  };

  const topClientsChartData: ChartData<'bar'> = {
    labels: data.topClientsByProfit.map(c => c.clientName),
    datasets: [{
      label: 'Beneficio Neto',
      data: data.topClientsByProfit.map(c => c.netProfit),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };

  const topClientsChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_, elements) => {
        const element = elements[0];
        if (element && data?.topClientsByProfit) {
            const clientIndex = element.index;
            const client = data.topClientsByProfit[clientIndex];
            if (client) {
                navigate(`/clients/${client.clientId}`);
            }
        }
    },
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'Beneficio Neto en los últimos 30 días' }
    }
  };

  return (
    <Container fluid>
      <Title order={2} mb="xl">Dashboard de Gerencia</Title>
      <Grid>
        {/* Widget Salud Financiera */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          {/* ✅ Se envuelve el Paper en un Anchor para hacerlo clicable */}
          <Anchor component={Link} to="/reports/invoicing" underline="never">
            <Paper withBorder p="md" shadow="sm" h="100%">
              <Title order={4} mb="md">Salud Financiera (Últimos 30 días)</Title>
              <Group justify="space-around" align="center">
                  <RingProgress
                      size={140}
                      thickness={14}
                      roundCaps
                      label={<Text c="blue" fw={700} ta="center" size="xl">{profitMargin.toFixed(1)}%</Text>}
                      sections={[{ value: profitMargin, color: 'blue' }]}
                  />
                  <Stack gap="xs">
                      <Text>Ingresos: {formatCurrency(data.financials.totalRevenue)}</Text>
                      <Text>Costes: {formatCurrency(data.financials.totalCosts)}</Text>
                      <Text fw={700}>Beneficio: {formatCurrency(data.financials.netProfit)}</Text>
                  </Stack>
              </Group>
            </Paper>
          </Anchor>
        </Grid.Col>

        {/* Widget Estado de Incidencias */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Paper withBorder p="md" shadow="sm" h="100%">
            <Title order={4} mb="md">Estado de Incidencias</Title>
            <Group justify="space-around" align="flex-end" h="80%">
                <Stack align="center" gap={0}>
                    <Text size="3rem" fw={700} c="orange">{data.incidents.openIncidents}</Text>
                    <Text c="dimmed">Abiertas</Text>
                </Stack>
                <Stack align="center" gap={0}>
                    <Text size="3rem" fw={700} c="green">{data.incidents.resolvedThisMonth}</Text>
                    <Text c="dimmed">Resueltas (Mes)</Text>
                </Stack>
            </Group>
          </Paper>
        </Grid.Col>

        {/* Widget Top 5 Productos por Coste */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" shadow="sm" h="100%">
            <Title order={4} mb="md">Top 5 Productos por Coste</Title>
            <Center style={{maxHeight: 250}}>
                <Doughnut data={topProductsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Center>
          </Paper>
        </Grid.Col>

        <Grid.Col span={12}>
          <Paper withBorder p="md" shadow="sm">
            <Title order={4} mb="md">Top 5 Clientes por Rentabilidad</Title>
            <div style={{ height: '300px' }}>
                <Bar 
                    data={topClientsChartData}
                    options={topClientsChartOptions}
                />
            </div>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}