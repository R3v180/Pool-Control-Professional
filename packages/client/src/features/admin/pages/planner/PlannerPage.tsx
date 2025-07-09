// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// Version: 1.0.1 (Install date-fns and fix implicit any type)
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Loader,
  Alert,
  Paper,
  Text,
  Grid,
  Card,
  Group,
  ActionIcon,
} from '@mantine/core';
import { useAuth } from '../../../../providers/AuthProvider.js';
import apiClient from '../../../../api/apiClient.js';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Tipos ---
interface ScheduledVisit {
  date: string;
  poolId: string;
  poolName: string;
  clientName: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function PlannerPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });

  useEffect(() => {
    if (!user) return;
    
    const fetchVisits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ApiResponse<ScheduledVisit[]>>('/visits/scheduled', {
          params: { date: currentDate.toISOString() },
        });
        setVisits(response.data.data);
      } catch (err) {
        setError('No se pudo cargar la planificación de visitas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisits();
  }, [currentDate, user]);

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const goToPreviousWeek = () => setCurrentDate(subDays(currentDate, 7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  return (
    <Container fluid>
      <Group justify="space-between" align="center">
        <Title order={2} my="lg">Planificador Semanal</Title>
        <Group>
          <ActionIcon variant="default" onClick={goToPreviousWeek} aria-label="Semana anterior">
            {'<'}
          </ActionIcon>
          <Text size="lg" fw={500}>
            {format(weekStart, 'd MMMM yyyy', { locale: es })}
          </Text>
          <ActionIcon variant="default" onClick={goToNextWeek} aria-label="Siguiente semana">
            {'>'}
          </ActionIcon>
        </Group>
      </Group>

      <Grid grow>
        {weekDays.map((day: Date) => (
          <Grid.Col key={day.toISOString()} span={{ base: 12, sm: 4, md: 'auto' }}>
            <Paper withBorder p="sm" style={{ height: '100%' }}>
              <Title order={5} ta="center" mb="md">
                {format(day, 'eeee d', { locale: es })}
              </Title>
              {visits
                .filter(v => new Date(v.date).toDateString() === day.toDateString())
                .map(visit => (
                  <Card key={visit.poolId} shadow="sm" p="xs" mb="xs" withBorder>
                    <Text fw={500}>{visit.poolName}</Text>
                    <Text size="sm" c="dimmed">{visit.clientName}</Text>
                  </Card>
              ))}
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}