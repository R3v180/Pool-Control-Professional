// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// version: 1.6.3 (Fix conditional styling merge with dnd-kit styles)
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
  Badge,
} from '@mantine/core';
import { useAuth } from '../../../../providers/AuthProvider.js';
import apiClient from '../../../../api/apiClient.js';
import { startOfWeek, endOfWeek, format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

// --- Tipos ---
interface Visit {
  id: string;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  hasIncident: boolean;
  pool: { name: string; client: { name: string; }; };
  technicianId: string | null;
}
interface Technician { id: string; name: string; }
interface ApiResponse<T> { success: boolean; data: T; }

// --- Componentes de Drag and Drop ---
function DraggableVisit({ visit }: { visit: Visit }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: visit.id, data: visit });
  const navigate = useNavigate();
  
  const isCompleted = visit.status === 'COMPLETED';

  // --- LÓGICA DE ESTILOS CORREGIDA ---
  // 1. Estilos base para la transformación del drag-and-drop
  const dndStyle = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;

  // 2. Nuestros estilos condicionales personalizados
  const customCardStyles: React.CSSProperties = {
    cursor: 'pointer',
  };
  
  if (isCompleted) {
    customCardStyles.opacity = 0.65;
    if (visit.hasIncident) {
      customCardStyles.borderLeft = '4px solid var(--mantine-color-red-6)';
    } else {
      customCardStyles.borderLeft = '4px solid var(--mantine-color-green-6)';
    }
  }

  // 3. Unimos ambos objetos de estilo
  const combinedDivStyle = { ...dndStyle, ...customCardStyles };

  const titleStyle = isCompleted ? { textDecoration: 'line-through' } : {};
  
  const handleCardClick = () => {
    navigate(`/visits/${visit.id}`);
  };

  return (
    // Aplicamos los estilos combinados al div exterior
    <div 
      ref={setNodeRef} 
      style={combinedDivStyle} 
      {...attributes} 
      {...listeners}
      onClick={handleCardClick} // El onClick ahora está en el div que se arrastra
    >
      <Card 
        shadow="sm" 
        p="xs" 
        withBorder 
        style={{ width: '100%', height: '100%' }} // La tarjeta ocupa todo el div
      >
        <Group justify="space-between">
          <Text fw={500} style={titleStyle}>{visit.pool.name}</Text>
          {isCompleted && (
            visit.hasIncident 
              ? <Badge size="sm" color="red" variant="light">⚠️ Incidencia</Badge>
              : <Badge size="sm" color="green" variant="light">OK</Badge>
          )}
        </Group>
        <Text size="sm" c="dimmed">{visit.pool.client.name}</Text>
        <Text size="xs" mt={4}>{format(new Date(visit.timestamp), 'eeee d', { locale: es })}</Text>
      </Card>
    </div>
  );
}

function DroppableArea({ id, children, title }: { id: string; children: React.ReactNode; title: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Paper ref={setNodeRef} withBorder p="sm" style={{ minHeight: 400, backgroundColor: isOver ? '#e7f5ff' : '#f1f3f5', transition: 'background-color 0.2s ease' }}>
      <Title order={5} ta="center" mb="md">{title}</Title>
      <Stack>{children}</Stack>
    </Paper>
  );
}

// --- Componente Principal ---
export function PlannerPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [visitsRes, techsRes] = await Promise.all([
        apiClient.get<ApiResponse<Visit[]>>('/visits/scheduled', { params: { date: currentDate.toISOString() } }),
        apiClient.get<ApiResponse<Technician[]>>('/users/technicians'),
      ]);
      setVisits(visitsRes.data.data);
      setTechnicians(techsRes.data.data);
    } catch (err) { setError('No se pudo cargar la planificación.'); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); // eslint-disable-next-line
  }, [currentDate, user]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over) return;

    const visitId = active.id as string;
    const targetId = String(over.id);
    const [type, id] = targetId.split('-');

    let technicianId: string | null = null;
    
    if (type === 'tech' && id) {
        technicianId = id;
    }

    const originalVisits = [...visits];
    const visitToUpdate = visits.find(v => v.id === visitId);
    if (!visitToUpdate || visitToUpdate.technicianId === technicianId) return;

    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, technicianId } : v));

    try {
      await apiClient.post('/visits/assign', { visitId, technicianId });
    } catch (err) {
      setError('No se pudo asignar la visita.');
      setVisits(originalVisits);
    }
  };

  if (isLoading) return <Loader size="xl" />;
  
  const weekRange = `${format(weekStart, 'd')} - ${format(weekEnd, 'd MMMM yyyy', { locale: es })}`;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Container fluid>
        {error && <Alert color="red" title="Error" mb="md">{error}</Alert>}
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Planificador Semanal</Title>
          <Group>
            <ActionIcon variant="default" onClick={() => setCurrentDate(subDays(currentDate, 7))}>{'<'}</ActionIcon>
            <Text size="lg" fw={500}>{weekRange}</Text>
            <ActionIcon variant="default" onClick={() => setCurrentDate(addDays(currentDate, 7))}>{'<'}</ActionIcon>
          </Group>
        </Group>

        <Grid grow>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <DroppableArea id="tech-null" title="Visitas Pendientes">
              {visits.filter(v => !v.technicianId).map(visit => <DraggableVisit key={visit.id} visit={visit} />)}
            </DroppableArea>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 10 }}>
            <Grid>
              {technicians.map(tech => (
                <Grid.Col key={tech.id} span={{ base: 12, md: 6, lg: 4 }}>
                   <DroppableArea id={`tech-${tech.id}`} title={tech.name}>
                    {visits
                      .filter(v => v.technicianId === tech.id)
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
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