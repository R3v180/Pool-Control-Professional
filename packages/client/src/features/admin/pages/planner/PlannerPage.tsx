// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// version: 8.0.0 (FEAT: Add detailed tooltips to events)
// description: Se implementan tooltips en las tarjetas de visita del calendario. Al pasar el ratón sobre una visita, ahora se muestra un resumen detallado con el cliente, piscina, dirección y estado.

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Container, Title, Loader, Alert, Group, Button, Stack, Text, Modal, Select, Paper, Badge, Grid, Checkbox, Tooltip, Divider
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

import { startOfWeek, endOfWeek, addDays, subDays, isBefore, startOfToday, setHours, addHours, getDayOfYear, format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '../../../../api/apiClient';
import './planner-styles.css';
import { ControlPanel } from './components/ControlPanel';
import { PendingWorkSidebar } from './components/PendingWorkSidebar';
import { useDndStore } from '../../../../stores/dnd.store';
import { BatchActionsToolbar } from './components/BatchActionsToolbar';

// --- Tipos ---
interface TechnicianResource { id: string; title: string; }
interface Technician extends TechnicianResource {
  isAvailable: boolean;
  availabilities: { startDate: string; endDate: string }[];
}
interface Zone { id: string; name: string; }
// ✅ 1. Añadir la dirección a la interfaz local de la piscina
interface Pool { id: string; name: string; address: string; client: { name: string }; }
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
        poolAddress: string; // ✅ 2. Añadir el nuevo campo a las props extendidas
        technicianId: string | null;
        technicianName: string;
        status: Visit['status'];
    }
}
const techColors = ['#228be6', '#15aabf', '#82c91e', '#fab005', '#fd7e14', '#e64980'];


interface EventCardProps {
  event: EventContentArg;
  isSelectionModeActive: boolean;
  isSelected: boolean;
  onSelect: (visitId: string) => void;
}

const EventCard = ({ event, isSelectionModeActive, isSelected, onSelect }: EventCardProps) => {
  const { extendedProps, start } = event.event;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionModeActive) {
      e.preventDefault(); 
      e.stopPropagation();
      onSelect(event.event.id);
    }
  };

  const cardStyle: React.CSSProperties = {
    overflow: 'hidden',
    height: '100%',
    borderLeft: `4px solid ${event.borderColor}`,
    backgroundColor: event.backgroundColor,
    position: 'relative', 
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: isSelectionModeActive ? 'pointer' : 'grab',
    ...(isSelected && {
      transform: 'scale(0.95)',
      boxShadow: `0 0 0 2px var(--mantine-color-blue-5)`,
      backgroundColor: 'var(--mantine-color-blue-0)',
    }),
  };

  // ✅ 3. Crear el contenido del tooltip
  const tooltipLabel = (
    <Stack gap="xs">
      <Text fw={700}>{event.event.title}</Text>
      <Text size="sm">Cliente: {extendedProps.clientName}</Text>
      <Text size="sm">Dirección: {extendedProps.poolAddress}</Text>
      <Divider />
      <Text size="sm">Fecha: {format(start!, 'eeee, d MMMM', { locale: es })}</Text>
      <Text size="sm">Técnico: {extendedProps.technicianName}</Text>
      <Badge size="sm" variant="light" color={extendedProps.status === 'COMPLETED' ? 'green' : 'blue'}>
        Estado: {extendedProps.status}
      </Badge>
    </Stack>
  );

  return (
    <Tooltip label={tooltipLabel} withArrow position="bottom" openDelay={500}>
      <Paper 
        p={4} 
        radius="sm" 
        withBorder 
        style={cardStyle}
        onClick={handleCardClick}
      >
        {isSelectionModeActive && (
          <Checkbox
            checked={isSelected}
            readOnly
            style={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}
            size="xs"
          />
        )}
        <Text size="xs" fw={700} truncate>{event.event.title}</Text>
        <Text size="xs" c="dimmed" truncate>{extendedProps.clientName}</Text>
        {extendedProps.technicianName && ( 
          <Badge variant="light" color="gray" size="xs" mt={4} style={{ textTransform: 'none' }}> 
            {extendedProps.technicianName} 
          </Badge> 
        )}
      </Paper>
    </Tooltip>
  );
};

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

  const [specialVisitModalOpened, { open: openSpecialVisitModal, close: closeSpecialVisitModal }] = useDisclosure(false);
  const [reassignModalOpened, { open: openReassignModal, close: closeReassignModal }] = useDisclosure(false);
  const [rescheduleModalOpened, { open: openRescheduleModal, close: closeRescheduleModal }] = useDisclosure(false);
  
  const specialVisitForm = useForm({
    initialValues: { poolId: '', technicianId: '', timestamp: new Date() },
    validate: {
      poolId: (value) => !value ? 'Debe seleccionar una piscina' : null,
      technicianId: (value) => !value ? 'Debe asignar un técnico' : null,
      timestamp: (value) => !value ? 'La fecha es obligatoria' : null,
    }
  });
  
  const reassignForm = useForm({
    initialValues: { newTechnicianId: '' },
    validate: {
      newTechnicianId: (value) => !value ? 'Debe seleccionar un técnico' : null,
    }
  });

  const rescheduleForm = useForm({
    initialValues: { newDate: null as Date | null },
    validate: {
      newDate: (value) => !value ? 'Debe seleccionar una fecha' : null,
    }
  });

  const { draggingVisit, setDraggingVisit } = useDndStore();
  
  const [isSelectionModeActive, setSelectionModeActive] = useState(false);
  const [selectedVisitIds, setSelectedVisitIds] = useState(new Set<string>());

  useEffect(() => {
    if (calendarRef.current) {
        setCalendarApi(calendarRef.current.getApi());
    }
  }, []);
  
  const handleToggleSelectionMode = (isActive: boolean) => {
    setSelectionModeActive(isActive);
    if (!isActive) {
      setSelectedVisitIds(new Set());
    }
  };

  const handleVisitSelection = (visitId: string) => {
    if (!isSelectionModeActive) return;

    setSelectedVisitIds(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(visitId)) {
        newSet.delete(visitId);
      } else {
        newSet.add(visitId);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedVisitIds(new Set());
  };

  const handleBatchReassign = async (values: { newTechnicianId: string }) => {
    const promises = Array.from(selectedVisitIds).map(visitId => {
      const eventToReassign = events.find(e => e.id === visitId);
      if (!eventToReassign) return Promise.resolve(); 

      return apiClient.patch(`/visits/${visitId}/reschedule`, {
        timestamp: eventToReassign.start.toISOString(),
        technicianId: values.newTechnicianId,
      });
    });

    try {
      await Promise.all(promises);
      closeReassignModal();
      reassignForm.reset();
      setSelectedVisitIds(new Set());
      setSelectionModeActive(false);
      await fetchAndProcessData();
      setSidebarVersion(v => v + 1);
    } catch (err) {
      console.error("Error en la reasignación en lote", err);
      setError("Error al reasignar las visitas. Por favor, inténtelo de nuevo.");
    }
  };

  const handleBatchReschedule = async (values: { newDate: Date | null }) => {
    if (!values.newDate) return;
    
    const promises = Array.from(selectedVisitIds).map(visitId => {
      const eventToReschedule = events.find(e => e.id === visitId);
      if (!eventToReschedule) return Promise.resolve();
      
      const newDateObject = new Date(values.newDate!);

      return apiClient.patch(`/visits/${visitId}/reschedule`, {
        timestamp: newDateObject.toISOString(),
        technicianId: eventToReschedule.extendedProps.technicianId,
      });
    });

    try {
      await Promise.all(promises);
      closeRescheduleModal();
      rescheduleForm.reset();
      setSelectedVisitIds(new Set());
      setSelectionModeActive(false);
      await fetchAndProcessData();
      setSidebarVersion(v => v + 1);
    } catch (err) {
      console.error("Error en el cambio de fecha en lote", err);
      setError("Error al cambiar la fecha de las visitas. Por favor, inténtelo de nuevo.");
    }
  };

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
                clientName: visit.pool.client.name,
                poolAddress: visit.pool.address, // ✅ Se añade la dirección a las props
                technicianId: visit.technician?.id || null,
                technicianName: visit.technician?.title || 'Sin Asignar', 
                status: visit.status
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
    if (isSelectionModeActive) {
      info.revert();
      return;
    }
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
  
  const handleNativeDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingVisit) return;

    const target = e.target as HTMLElement;
    const cell = target.closest('[data-date]') as HTMLElement | null;

    if (!cell) {
        setDraggingVisit(null);
        return; 
    }

    const dateStr = cell.getAttribute('data-date');
    if (!dateStr) {
        setDraggingVisit(null);
        return; 
    }

    const resourceId = cell.getAttribute('data-resource-id') || null;
    const newDate = new Date(dateStr);
    
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
      closeSpecialVisitModal();
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
      <Modal opened={specialVisitModalOpened} onClose={closeSpecialVisitModal} title="Crear Orden de Trabajo Especial" centered>
        <form onSubmit={specialVisitForm.onSubmit(handleCreateSpecialVisit)}>
            <Stack>
                <Select data={pools} label="Piscina" placeholder='Busca o selecciona una piscina' searchable required {...specialVisitForm.getInputProps('poolId')} />
                <Select data={technicianOptions} label="Asignar a" placeholder='Selecciona un técnico' searchable required {...specialVisitForm.getInputProps('technicianId')} />
                <DatePickerInput label="Fecha y Hora" valueFormat="DD/MM/YYYY HH:mm" required {...specialVisitForm.getInputProps('timestamp')} />
                <Button type="submit" mt="md">Crear Visita</Button>
            </Stack>
        </form>
      </Modal>

      <Modal opened={reassignModalOpened} onClose={closeReassignModal} title={`Reasignar ${selectedVisitIds.size} visitas`} centered>
        <form onSubmit={reassignForm.onSubmit(handleBatchReassign)}>
          <Stack>
            <Select 
              label="Seleccione el nuevo técnico"
              placeholder='Selecciona un técnico de la lista'
              data={technicianOptions}
              searchable
              required
              {...reassignForm.getInputProps('newTechnicianId')}
            />
            <Button type="submit" mt="md">Confirmar Reasignación</Button>
          </Stack>
        </form>
      </Modal>
      
      <Modal opened={rescheduleModalOpened} onClose={closeRescheduleModal} title={`Mover ${selectedVisitIds.size} visitas`} centered>
        <form onSubmit={rescheduleForm.onSubmit(handleBatchReschedule)}>
          <Stack>
            <DatePickerInput
              label="Seleccione la nueva fecha"
              placeholder="Elige una fecha"
              required
              {...rescheduleForm.getInputProps('newDate')}
            />
            <Button type="submit" mt="md">Confirmar Cambio de Fecha</Button>
          </Stack>
        </form>
      </Modal>

      <Group justify="space-between" align="center" my="lg">
        <Title order={2}>Planning Hub</Title>
        <Group>
          <Button onClick={openSpecialVisitModal} variant="light">Crear Orden Especial</Button>
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
        isSelectionModeActive={isSelectionModeActive}
        onSelectionModeChange={handleToggleSelectionMode}
      />
      
      <Grid>
          <Grid.Col span={{ base: 12, lg: 3 }}>
              <PendingWorkSidebar 
                refreshKey={sidebarVersion} 
                isSelectionModeActive={isSelectionModeActive}
                selectedVisitIds={selectedVisitIds}
                onSelectVisit={handleVisitSelection}
              />
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
                      editable={!isSelectionModeActive} 
                      droppable={false} 
                      eventDrop={handleEventDrop}
                      eventContent={(arg) => (
                        <EventCard 
                          event={arg} 
                          isSelectionModeActive={isSelectionModeActive}
                          isSelected={selectedVisitIds.has(arg.event.id)}
                          onSelect={handleVisitSelection}
                        />
                      )}
                      height="auto"
                  />
              </Paper>
          </Grid.Col>
      </Grid>
      
      <BatchActionsToolbar 
        selectedCount={selectedVisitIds.size} 
        onClearSelection={handleClearSelection} 
        onReassignClick={openReassignModal}
        onRescheduleClick={openRescheduleModal}
      />
    </Container>
  );
}