// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// Version: 1.2.2 (Connect Drag and Drop to the backend API)
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
  Stack,
} from '@mantine/core';
import { useAuth } from '../../../../providers/AuthProvider.js';
import apiClient from '../../../../api/apiClient.js';
import { startOfWeek, format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

// --- Tipos ---
interface ScheduledVisit {
  id: string;
  date: string;
  poolId: string;
  poolName: string;
  clientName: string;
  technicianId: string | null;
}

interface Technician {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componentes de Drag and Drop ---

function DraggableVisit({ visit }: { visit: ScheduledVisit }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: visit.id,
    data: visit,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card shadow="sm" p="xs" withBorder>
        <Text fw={500}>{visit.poolName}</Text>
        <Text size="sm" c="dimmed">{visit.clientName}</Text>
        <Text size="xs" mt={4}>{format(new Date(visit.date), 'eeee d', { locale: es })}</Text>
      </Card>
    </div>
  );
}

function DroppableArea({ id, children, title }: { id: string; children: React.ReactNode; title: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Paper 
      ref={setNodeRef} 
      withBorder 
      p="sm" 
      style={{ 
        height: '100%', 
        backgroundColor: isOver ? '#e7f5ff' : '#f1f3f5',
        transition: 'background-color 0.2s ease'
      }}
    >
      <Title order={5} ta="center" mb="md">{title}</Title>
      <Stack>{children}</Stack>
    </Paper>
  );
}


// --- Componente Principal ---
export function PlannerPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [visitsRes, techsRes] = await Promise.all([
        apiClient.get<ApiResponse<ScheduledVisit[]>>('/visits/scheduled', {
          params: { date: currentDate.toISOString() },
        }),
        apiClient.get<ApiResponse<Technician[]>>('/users/technicians'),
      ]);
      
      setVisits(visitsRes.data.data);
      setTechnicians(techsRes.data.data);
    } catch (err) {
      setError('No se pudo cargar la planificación.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, user]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over) return;

    const visit = active.data.current as ScheduledVisit;
    const targetTechnicianId = over.id === 'unassigned' ? null : String(over.id);

    // Evitar llamadas a la API si no hay cambio
    if (visit.technicianId === targetTechnicianId) return;

    // Actualización optimista de la UI
    setVisits(prevVisits => 
      prevVisits.map(v => 
        v.id === visit.id ? { ...v, technicianId: targetTechnicianId } : v
      )
    );

    try {
      // Llamada a la API para persistir el cambio
      await apiClient.post('/visits/assign', {
        poolId: visit.poolId,
        date: visit.date,
        technicianId: targetTechnicianId,
      });
    } catch (err) {
      setError('No se pudo asignar la visita. Reintentando...');
      // En caso de error, revertimos la UI volviendo a cargar los datos del servidor
      await fetchData();
    }
  };

  if (isLoading) return <Loader size="xl" />;
  
  const goToPreviousWeek = () => setCurrentDate(subDays(currentDate, 7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Container fluid>
        {error && <Alert color="red" title="Error" withCloseButton onClose={() => setError(null)} mb="md">{error}</Alert>}
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Planificador Semanal</Title>
          <Group>
            <ActionIcon variant="default" onClick={goToPreviousWeek}>{'<'}</ActionIcon>
            <Text size="lg" fw={500}>{format(weekStart, 'd MMMM yyyy', { locale: es })}</Text>
            <ActionIcon variant="default" onClick={goToNextWeek}>{'>'}</ActionIcon>
          </Group>
        </Group>

        <Grid grow>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <DroppableArea id="unassigned" title="Visitas Pendientes">
              {visits
                .filter(v => v.technicianId === null)
                .map(visit => <DraggableVisit key={visit.id} visit={visit} />)
              }
            </DroppableArea>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Grid>
              {technicians.map(tech => (
                <Grid.Col key={tech.id} span={{ base: 12, lg: 6, xl: 4 }}>
                   <DroppableArea id={tech.id} title={tech.name}>
                    {visits
                      .filter(v => v.technicianId === tech.id)
                      .map(visit => <DraggableVisit key={visit.id} visit={visit} />)
                    }
                   </DroppableArea>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>
        </Grid>
      </Container>
    </DndContext>
  );
}