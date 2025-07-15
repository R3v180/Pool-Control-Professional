// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// version: 2.3.1 (FIXED)
// description: Provides the complete and final code for the v2 planner, including special order creation.

import { useEffect, useState, useMemo } from 'react';
import {
  Container, Title, Loader, Alert, Paper, Text, Grid, Card, Group, ActionIcon,
  Stack, Badge, Switch, Box, Button, Modal, Select, Textarea,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useAuth } from '../../../../providers/AuthProvider.js';
import apiClient from '../../../../api/apiClient.js';
import { startOfWeek, endOfWeek, format, addDays, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

// --- Tipos ---
interface Visit {
  id: string; timestamp: string; status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  hasIncident: boolean; pool: { name: string; client: { name: string; }; };
  technicianId: string | null;
}
interface Technician { id: string; name: string; isAvailable: boolean; }
interface ClientWithPools { id: string; name: string; pools: { id: string; name: string }[]; }
interface ApiResponse<T> { success: boolean; data: T; }

// --- Componentes D&D ---
function DraggableVisit({ visit }: { visit: Visit }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: visit.id, data: visit });
  const navigate = useNavigate();
  
  const isCompleted = visit.status === 'COMPLETED';
  const dndStyle = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;
  
  const customCardStyles: React.CSSProperties = {
    cursor: 'pointer', borderLeft: '4px solid transparent',
  };

  if (isCompleted) {
    customCardStyles.opacity = 0.65;
    customCardStyles.borderLeftColor = visit.hasIncident ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-green-6)';
  } else if (startOfDay(new Date(visit.timestamp)) < startOfDay(new Date())) {
    customCardStyles.borderLeftColor = 'var(--mantine-color-orange-6)';
  }

  const combinedDivStyle = { ...dndStyle, ...customCardStyles };
  const titleStyle = isCompleted ? { textDecoration: 'line-through' } : {};
  const handleCardClick = () => navigate(`/visits/${visit.id}`);

  return (
    <div ref={setNodeRef} style={combinedDivStyle} {...attributes} {...listeners} onClick={handleCardClick}>
      <Card shadow="sm" p="xs" withBorder style={{ width: '100%', height: '100%' }}>
        <Group justify="space-between">
          <Text fw={500} style={titleStyle}>{visit.pool.name}</Text>
          {isCompleted && (visit.hasIncident ? <Badge size="sm" color="red" variant="light">⚠️ Incidencia</Badge> : <Badge size="sm" color="green" variant="light">OK</Badge>)}
        </Group>
        <Text size="sm" c="dimmed">{visit.pool.client.name}</Text>
        <Text size="xs" mt={4}>{format(new Date(visit.timestamp), 'eeee, d MMM', { locale: es })}</Text>
      </Card>
    </div>
  );
}

function DroppableArea({ id, children, title, bgColor, disabled }: { id: string; children: React.ReactNode; title: React.ReactNode; bgColor?: string; disabled?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  return (
    <Paper ref={setNodeRef} withBorder p="sm" style={{ height: '100%', minHeight: 400, backgroundColor: isOver && !disabled ? '#e7f5ff' : (bgColor || '#f1f3f5'), transition: 'background-color 0.2s ease', opacity: disabled ? 0.5 : 1 }}>
      <Box h="100%">
        <Title order={5} ta="center" mb="md">{title}</Title>
        <Stack>{children}</Stack>
      </Box>
    </Paper>
  );
}

// --- Componente Principal ---
export function PlannerPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [clients, setClients] = useState<ClientWithPools[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const specialVisitForm = useForm({
    initialValues: {
      poolId: '',
      timestamp: new Date(),
      technicianId: null as string | null,
      notes: '',
    },
    validate: {
      poolId: (value) => !value ? 'Debe seleccionar una piscina' : null,
      timestamp: (value) => !value ? 'Debe seleccionar una fecha' : null,
    },
  });

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [visitsRes, techsRes, clientsRes] = await Promise.all([
        apiClient.get<ApiResponse<Visit[]>>('/visits/scheduled', { params: { date: currentDate.toISOString(), includeOverdue: 'true' } }),
        apiClient.get<ApiResponse<Technician[]>>('/users/technicians'),
        apiClient.get<ApiResponse<ClientWithPools[]>>('/clients'),
      ]);
      setVisits(visitsRes.data.data);
      setTechnicians(techsRes.data.data);
      setClients(clientsRes.data.data);
    } catch (err) { setError('No se pudo cargar la planificación.'); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, user]);

  const handleAvailabilityChange = async (techId: string, newAvailability: boolean) => {
    const originalTechnicians = [...technicians];
    setTechnicians(current => current.map(t => t.id === techId ? { ...t, isAvailable: newAvailability } : t));
    
    if (!newAvailability) {
        setVisits(current => current.map(v => v.technicianId === techId ? { ...v, technicianId: null } : v));
    }

    try {
      await apiClient.patch(`/users/${techId}/availability`, { isAvailable: newAvailability });
    } catch (err) {
      setError('No se pudo actualizar la disponibilidad del técnico.');
      setTechnicians(originalTechnicians);
    }
  };

  const { overdueVisits, weekVisits, orphanVisits } = useMemo(() => {
    const startOfCurrentWeek = startOfDay(weekStart);
    
    const allOverdue = visits.filter(v => startOfDay(new Date(v.timestamp)) < startOfCurrentWeek && v.status === 'PENDING');
    const allWeek = visits.filter(v => !allOverdue.find(ov => ov.id === v.id));
    
    const unavailableTechIds = technicians.filter(t => !t.isAvailable).map(t => t.id);
    const orphans = allWeek.filter(v => v.technicianId && unavailableTechIds.includes(v.technicianId));
    
    return {
      overdueVisits: allOverdue,
      weekVisits: allWeek,
      orphanVisits: orphans,
    };
  }, [visits, technicians, weekStart]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over || over.disabled) return;

    const visitId = active.id as string;
    const targetContainerId = String(over.id);
    
    const technicianId = targetContainerId.startsWith('tech-') ? targetContainerId.split('-')[1] || null : null;
    
    const originalVisits = [...visits];
    const visitToUpdate = visits.find(v => v.id === visitId);
    if (!visitToUpdate || (visitToUpdate.technicianId === technicianId && targetContainerId !== 'tech-null')) return;

    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, technicianId } : v));
    try {
      await apiClient.post('/visits/assign', { visitId, technicianId });
    } catch (err) {
      setError('No se pudo asignar la visita.');
      setVisits(originalVisits);
    }
  };

  const handleSpecialVisitSubmit = async (values: typeof specialVisitForm.values) => {
    try {
        await apiClient.post('/visits/special', values);
        closeModal();
        specialVisitForm.reset();
        await fetchData();
    } catch (err) {
        specialVisitForm.setErrors({ notes: 'No se pudo crear la visita especial.' });
    }
  };

  const poolOptions = useMemo(() => {
    return clients.flatMap(client => 
        client.pools.map(pool => ({
            value: pool.id,
            label: `${client.name} - ${pool.name}`,
            group: client.name,
        }))
    );
  }, [clients]);
  const techOptions = useMemo(() => technicians.map(t => ({ value: t.id, label: t.name })), [technicians]);

  if (isLoading) return <Loader size="xl" />;
  const weekRange = `${format(weekStart, 'd')} - ${format(weekEnd, 'd MMMM yyyy', { locale: es })}`;
  
  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title="Crear Visita Especial" centered>
        <form onSubmit={specialVisitForm.onSubmit(handleSpecialVisitSubmit)}>
            <Stack>
                <Select label="Piscina" placeholder="Seleccione una piscina" data={poolOptions} searchable required {...specialVisitForm.getInputProps('poolId')} />
                <DateTimePicker label="Fecha y Hora de la Visita" placeholder="Seleccione fecha y hora" required locale="es" {...specialVisitForm.getInputProps('timestamp')} />
                <Select label="Asignar a Técnico (opcional)" placeholder="Sin asignar" data={techOptions} clearable {...specialVisitForm.getInputProps('technicianId')} />
                <Textarea label="Motivo de la visita / Notas" placeholder="Ej: Revisión de urgencia por agua turbia" {...specialVisitForm.getInputProps('notes')} />
                <Button type="submit" mt="md">Crear Visita</Button>
            </Stack>
        </form>
      </Modal>

      <DndContext onDragEnd={handleDragEnd}>
        <Container fluid>
          {error && <Alert color="red" title="Error" mb="md" withCloseButton onClose={() => setError(null)}>{error}</Alert>}
          <Group justify="space-between" align="center">
            <Title order={2} my="lg">Planificador Semanal v2</Title>
            <Group>
              <Button onClick={openModal} variant="light" leftSection="+">Crear Visita Especial</Button>
              <ActionIcon variant="default" onClick={() => setCurrentDate(subDays(currentDate, 7))}>{'<'}</ActionIcon>
              <Text size="lg" fw={500}>{weekRange}</Text>
              <ActionIcon variant="default" onClick={() => setCurrentDate(addDays(currentDate, 7))}>{'>'}</ActionIcon>
            </Group>
          </Group>
          
          <Grid grow>
            <Grid.Col span={{ base: 12, lg: 2 }}>
              <DroppableArea id="overdue-column" title={`Deuda (${overdueVisits.length})`} bgColor="var(--mantine-color-red-0)">
                {overdueVisits.map(visit => <DraggableVisit key={visit.id} visit={visit} />)}
              </DroppableArea>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 2 }}>
              <DroppableArea id="tech-null" title="Sin Asignar / Huérfanas">
                {[
                  ...weekVisits.filter(v => !v.technicianId),
                  ...orphanVisits
                ].map(visit => <DraggableVisit key={visit.id} visit={visit} />)}
              </DroppableArea>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Grid>
                {technicians.map(tech => (
                  <Grid.Col key={tech.id} span={{ base: 12, md: 6, xl: 4 }}>
                     <DroppableArea 
                        id={`tech-${tech.id}`}
                        disabled={!tech.isAvailable}
                        bgColor={!tech.isAvailable ? 'var(--mantine-color-gray-2)' : undefined}
                        title={
                          <Group justify="center" gap="xs">
                            <Text fw={500}>{tech.name}</Text>
                            <Switch
                              size="xs"
                              checked={tech.isAvailable}
                              onChange={(e) => handleAvailabilityChange(tech.id, e.currentTarget.checked)}
                            />
                          </Group>
                        }
                      >
                        {tech.isAvailable && weekVisits
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
    </>
  );
}