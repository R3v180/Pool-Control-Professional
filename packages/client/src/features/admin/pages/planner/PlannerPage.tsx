// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// version: 6.1.0 (FIX: Correct native drop info retrieval)
// description: Se corrige la forma de obtener la información de la celda en el drop nativo, leyendo los atributos 'data-date' del DOM en lugar de usar métodos inexistentes de la API.

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Container, Title, Loader, Alert, Group, Button, Stack, Text, Modal, Select, Paper, Badge, Grid
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import esLocale from '@fullcalendar/core/locales/es'; 
import type { EventContentArg, EventDropArg, CalendarApi } from '@fullcalendar/core';

import { startOfWeek, endOfWeek, addDays, subDays, isBefore, startOfToday, setHours, addHours, getDayOfYear } from 'date-fns';
import apiClient from '../../../../api/apiClient';
import './planner-styles.css';
import { ControlPanel } from './components/ControlPanel';
import { PendingWorkSidebar } from './components/PendingWorkSidebar';
import { useDndStore } from '../../../../stores/dnd.store';

// --- Tipos ---
interface TechnicianResource { id: string; title: string; }
interface Technician extends TechnicianResource {
  isAvailable: boolean;
  availabilities: { startDate: string; endDate: string }[];
}
interface Zone { id: string; name: string; }
interface Pool { id: string; name: string; client: { name: string }; }
interface Visit { id: string; timestamp: string; status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; pool: Pool; technician: Technician | null; }
interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    allDay: boolean;
    backgroundColor: string;
    borderColor: string;
    resourceId?: string;
    extendedProps: {
        clientName: string;
        technicianId: string | null;
        technicianName: string;
        status: Visit['status'];
    }
}
const techColors = ['#228be6', '#15aabf', '#82c91e', '#fab005', '#fd7e14', '#e64980'];


// --- Componente EventCard ---
const EventCard = ({ event }: { event: EventContentArg }) => {
    const { extendedProps } = event.event;
    return (
        <Paper p={4} radius="sm" withBorder style={{ overflow: 'hidden', height: '100%', borderLeft: `4px solid ${event.borderColor}`, backgroundColor: event.backgroundColor }}>
            <Text size="xs" fw={700} truncate>{event.event.title}</Text>
            <Text size="xs" c="dimmed" truncate>{extendedProps.clientName}</Text>
            {extendedProps.technicianName && ( <Badge variant="light" color="gray" size="xs" mt={4} style={{ textTransform: 'none' }}> {extendedProps.technicianName} </Badge> )}
        </Paper>
    )
}

export function PlannerPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null);
  const [week, setWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<TechnicianResource[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [pools, setPools] = useState<{ value: string; label: string; }[]>([]);

  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState('dayGridWeek');
  
  const [sidebarVersion, setSidebarVersion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const specialVisitForm = useForm({
    initialValues: { poolId: '', technicianId: '', timestamp: new Date() },
    validate: {
      poolId: (value) => !value ? 'Debe seleccionar una piscina' : null,
      technicianId: (value) => !value ? 'Debe asignar un técnico' : null,
      timestamp: (value) => !value ? 'La fecha es obligatoria' : null,
    }
  });

  const { draggingVisit, setDraggingVisit } = useDndStore();
  
  useEffect(() => {
    if (calendarRef.current) {
        setCalendarApi(calendarRef.current.getApi());
    }
  }, []);

  const fetchAndProcessData = async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStart = week;
      const weekEnd = endOfWeek(week, { weekStartsOn: 1 });

      const params = {
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        technicianIds: selectedTechnicians,
        zoneIds: selectedZones,
      };

      const [visitsRes, techsRes, zonesRes, clientsRes] = await Promise.all([
        apiClient.get('/visits/scheduled', { params }),
        apiClient.get('/users/technicians'),
        apiClient.get('/zones'),
        apiClient.get('/clients')
      ]);

      const allVisits: Visit[] = visitsRes.data.data;
      const allResources: TechnicianResource[] = techsRes.data.data;
      const allZones: Zone[] = zonesRes.data.data;

      setResources(allResources);
      setZones(allZones);
      
      const poolOptions = clientsRes.data.data.flatMap((client: any) => client.pools.map((pool: any) => ({ value: pool.id, label: `${client.name} - ${pool.name}` })));
      setPools(poolOptions);

      const dailyCounters: Record<string, number> = {};
      const WORK_DAY_START_HOUR = 8;

      const calendarEvents = allVisits.map((visit): CalendarEvent => {
        let visitDate = new Date(visit.timestamp);
        const techIdForCounter = visit.technician?.id || 'unassigned';
        const dayKey = `${techIdForCounter}-${getDayOfYear(visitDate)}`;
        if (dailyCounters[dayKey] === undefined) { dailyCounters[dayKey] = 0; } else { dailyCounters[dayKey]++; }
        if (visitDate.getHours() === 0 && visitDate.getMinutes() === 0) { visitDate = setHours(visitDate, WORK_DAY_START_HOUR + dailyCounters[dayKey]); }
        const techIndex = allResources.findIndex(t => t.id === visit.technician?.id);
        const borderColor = techColors[techIndex % techColors.length] || '#ced4da';
        let backgroundColor = 'white';
        if (visit.status === 'COMPLETED') { backgroundColor = '#e6fcf5'; } 
        else if (isBefore(visitDate, startOfToday())) { backgroundColor = '#fff5f5'; }
        
        return {
            id: visit.id, title: visit.pool.name, start: visitDate, end: addHours(visitDate, 1),
            allDay: viewMode === 'dayGridWeek', backgroundColor, borderColor, resourceId: visit.technician?.id || undefined,
            extendedProps: {
                clientName: visit.pool.client.name, technicianId: visit.technician?.id || null,
                technicianName: visit.technician?.title || 'Sin Asignar', status: visit.status
            }
        };
      });
      setEvents(calendarEvents);
    } catch (err) {
      setError('No se pudo cargar la planificación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessData();
  }, [week, selectedTechnicians, selectedZones, viewMode, sidebarVersion]);

  const handleEventDrop = (info: EventDropArg) => {
    const { event, newResource } = info;
    const newDate = event.start;
    if (!newDate) return;
    const newTechnicianId = newResource ? newResource.id : event.extendedProps.technicianId;
    apiClient.patch(`/visits/${event.id}/reschedule`, {
      timestamp: newDate.toISOString(),
      technicianId: newTechnicianId,
    }).catch(() => {
      setError('Error al reprogramar la visita. Recargando...');
      info.revert();
    });
  };
  
  // ✅ CORRECCIÓN DE LA LÓGICA DE DROP
  const handleNativeDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingVisit) return;

    const target = e.target as HTMLElement;
    // Buscamos hacia arriba en el DOM hasta encontrar la celda con la fecha.
    const cell = target.closest('[data-date]') as HTMLElement | null;

    if (!cell) {
        setDraggingVisit(null);
        return; // No se soltó en una celda válida
    }

    const dateStr = cell.getAttribute('data-date');
    if (!dateStr) {
        setDraggingVisit(null);
        return; // La celda no tiene fecha
    }

    // En la vista de timeline, la celda también tiene el ID del recurso (técnico)
    const resourceId = cell.getAttribute('data-resource-id') || null;

    const newDate = new Date(dateStr);
    
    console.log('--- 🟢 [Planner Page] NATIVE DROP Detectado! Soltando visita:', draggingVisit.id);
    console.log('--- 🟢 [Planner Page] Nueva Fecha:', newDate, 'Nuevo Técnico ID:', resourceId);

    const visitToReschedule = draggingVisit;
    setDraggingVisit(null);

    try {
      await apiClient.patch(`/visits/${visitToReschedule.id}/reschedule`, {
        timestamp: newDate.toISOString(),
        technicianId: resourceId,
      });
      setSidebarVersion(v => v + 1);
    } catch (err) {
      setError('Error al reasignar la visita.');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCreateSpecialVisit = async () => {
    try {
      await apiClient.post('/visits/special', specialVisitForm.values);
      closeModal();
      specialVisitForm.reset();
      await fetchAndProcessData();
    } catch (err) {
      specialVisitForm.setErrors({ poolId: 'Error al crear la orden especial.' });
    }
  };
  
  const technicianOptions = useMemo(() => resources.map(t => ({ value: t.id, label: t.title })), [resources]);
  const zoneOptions = useMemo(() => zones.map(z => ({ value: z.id, label: z.name })), [zones]);
  
  if (loading) return <Container p="xl" style={{display: 'flex', justifyContent: 'center'}}><Loader size="xl" /></Container>;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  return (
    <Container fluid>
      <Modal opened={modalOpened} onClose={closeModal} title="Crear Orden de Trabajo Especial" centered>
        <form onSubmit={specialVisitForm.onSubmit(handleCreateSpecialVisit)}>
            <Stack>
                <Select data={pools} label="Piscina" placeholder='Busca o selecciona una piscina' searchable required {...specialVisitForm.getInputProps('poolId')} />
                <Select data={technicianOptions} label="Asignar a" placeholder='Selecciona un técnico' searchable required {...specialVisitForm.getInputProps('technicianId')} />
                <DatePickerInput label="Fecha y Hora" valueFormat="DD/MM/YYYY HH:mm" required {...specialVisitForm.getInputProps('timestamp')} />
                <Button type="submit" mt="md">Crear Visita</Button>
            </Stack>
        </form>
      </Modal>

      <Group justify="space-between" align="center" my="lg">
        <Title order={2}>Planning Hub</Title>
        <Group>
          <Button onClick={openModal} variant="light">Crear Orden Especial</Button>
          <Button.Group>
            <Button variant="default" onClick={() => setWeek(subDays(week, 7))}>{'< Semana Anterior'}</Button>
            <Button variant="default" onClick={() => setWeek(addDays(week, 7))}>{'Semana Siguiente >'}</Button>
          </Button.Group>
        </Group>
      </Group>
      
      <ControlPanel
        technicianOptions={technicianOptions}
        zoneOptions={zoneOptions}
        selectedTechnicians={selectedTechnicians}
        selectedZones={selectedZones}
        onTechnicianChange={setSelectedTechnicians}
        onZoneChange={setSelectedZones}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <Grid>
          <Grid.Col span={{ base: 12, lg: 3 }}>
              <PendingWorkSidebar refreshKey={sidebarVersion} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 9 }}>
              <Text size="lg" fw={500} mb="xl">
                  {calendarApi?.formatRange(
                      startOfWeek(week, { weekStartsOn: 1 }),
                      endOfWeek(week, { weekStartsOn: 1 }),
                      { month: 'long', day: 'numeric', year: 'numeric', separator: ' - ' }
                  ) || ''}
              </Text>
              
              <Paper 
                withBorder p="md" shadow="sm"
                onDrop={handleNativeDrop}
                onDragOver={handleDragOver}
                style={draggingVisit ? { border: '2px dashed var(--mantine-color-blue-5)', backgroundColor: 'var(--mantine-color-blue-0)' } : {}}
              >
                  <FullCalendar
                      key={viewMode} 
                      ref={calendarRef}
                      plugins={[dayGridPlugin, interactionPlugin, resourceTimelinePlugin]}
                      schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                      initialView={viewMode}
                      locales={[esLocale]}
                      locale="es"
                      firstDay={1}
                      headerToolbar={false}
                      events={events}
                      resources={resources}
                      resourceAreaHeaderContent="Equipo"
                      slotMinTime="08:00:00"
                      slotMaxTime="19:00:00"
                      slotDuration="01:00:00"
                      editable={true}
                      droppable={false} 
                      eventDrop={handleEventDrop}
                      eventContent={(arg) => <EventCard event={arg} />}
                      height="auto"
                  />
              </Paper>
          </Grid.Col>
      </Grid>
    </Container>
  );
}