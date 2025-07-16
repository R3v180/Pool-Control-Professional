// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// version: 9.0.9 (REFINED: Implement context-aware calendar title)
// description: Se refina el título del calendario para que sea contextual. Muestra el rango de la semana en la vista semanal y la fecha del día en la vista de equipo.

import { useState, useMemo, useRef } from 'react';
import {
  Container, Title, Loader, Alert, Group, Button, Paper, Badge, Grid, Text
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import esLocale from '@fullcalendar/core/locales/es'; 
import type { EventDropArg } from '@fullcalendar/core';

import { startOfWeek, addDays, subDays, format, getISOWeek } from 'date-fns';
import apiClient from '../../../../api/apiClient';
import './planner-styles.css';
import { ControlPanel } from './components/ControlPanel';
import { PendingWorkSidebar } from './components/PendingWorkSidebar';
import { useDndStore } from '../../../../stores/dnd.store';
import { BatchActionsToolbar } from './components/BatchActionsToolbar';
import { usePlannerData } from './hooks/usePlannerData';
import { CreateSpecialVisitModal } from './components/CreateSpecialVisitModal';
import { BatchReassignModal } from './components/BatchReassignModal';
import { BatchRescheduleModal } from './components/BatchRescheduleModal';
import { EventCard } from './components/EventCard';

export function PlannerPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [week, setWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState('dayGridWeek');
  
  const [sidebarVersion, setSidebarVersion] = useState(0);

  const [specialVisitModalOpened, { open: openSpecialVisitModal, close: closeSpecialVisitModal }] = useDisclosure(false);
  const [reassignModalOpened, { open: openReassignModal, close: closeReassignModal }] = useDisclosure(false);
  const [rescheduleModalOpened, { open: openRescheduleModal, close: closeRescheduleModal }] = useDisclosure(false);
  
  const { draggingVisit, setDraggingVisit } = useDndStore();
  
  const [isSelectionModeActive, setSelectionModeActive] = useState(false);
  const [selectedVisitIds, setSelectedVisitIds] = useState(new Set<string>());

  const { 
    events, 
    resources, 
    pools,
    zones, 
    workloadMap, 
    loading, 
    error,
    refetch,
  } = usePlannerData({ week, selectedTechnicians, selectedZones, sidebarVersion });

  const technicianOptions = useMemo(() => resources.map(t => ({ value: t.id, label: t.title })), [resources]);
  const zoneOptions = useMemo(() => zones.map(z => ({ value: z.id, label: z.name })), [zones]);
  
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

  const handleBatchSuccess = () => {
    closeReassignModal();
    closeRescheduleModal();
    setSelectedVisitIds(new Set());
    setSelectionModeActive(false);
    refetch(); 
    setSidebarVersion(v => v + 1);
  };

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
      alert('Error al reprogramar la visita. Recargando...');
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
      alert('Error al reasignar la visita.');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  if (loading) return <Container p="xl" style={{display: 'flex', justifyContent: 'center'}}><Loader size="xl" /></Container>;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  return (
    <Container fluid>
      <CreateSpecialVisitModal 
        opened={specialVisitModalOpened}
        onClose={closeSpecialVisitModal}
        onSuccess={() => {
          closeSpecialVisitModal();
          refetch();
        }}
        poolOptions={pools}
        technicianOptions={technicianOptions}
      />
      
      <BatchReassignModal
        opened={reassignModalOpened}
        onClose={closeReassignModal}
        onSuccess={handleBatchSuccess}
        selectedVisitIds={selectedVisitIds}
        allEvents={events}
        technicianOptions={technicianOptions}
      />

      <BatchRescheduleModal
        opened={rescheduleModalOpened}
        onClose={closeRescheduleModal}
        onSuccess={handleBatchSuccess}
        selectedVisitIds={selectedVisitIds}
        allEvents={events}
      />

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
              <Paper 
                withBorder p="md" shadow="sm"
                onDrop={handleNativeDrop}
                onDragOver={handleDragOver}
                style={draggingVisit ? { border: '2px dashed var(--mantine-color-blue-5)', backgroundColor: 'var(--mantine-color-blue-0)' } : {}}
              >
                  <FullCalendar
                      key={`${getISOWeek(week)}-${viewMode}`} 
                      ref={calendarRef}
                      plugins={[dayGridPlugin, interactionPlugin, resourceTimelinePlugin]}
                      schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                      initialView={viewMode}
                      initialDate={week}
                      locales={[esLocale]}
                      locale="es"
                      firstDay={1}
                      // ✅ Configuración del título contextual
                      headerToolbar={{
                        left: '',
                        center: 'title',
                        right: ''
                      }}
                      titleFormat={ // Formato del título principal
                        viewMode === 'dayGridWeek' 
                          ? { year: 'numeric', month: 'short', day: 'numeric' }
                          : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                      }
                      events={events}
                      resources={resources}
                      resourceLabelContent={(arg) => {
                        if (viewMode !== 'resourceTimelineDay') {
                          return <Text fw={500}>{arg.resource.title}</Text>;
                        }
                        
                        const currentDate = arg.view.currentStart;
                        const dateStr = format(currentDate, 'yyyy-MM-dd');
                        const dayKey = `${arg.resource.id}-${dateStr}`;

                        const workload = workloadMap.get(dayKey);
                        const visitCount = workload ? workload.visitCount : 0;
                        const hourCount = visitCount;

                        return (
                          <Group justify="space-between" w="100%" wrap="nowrap">
                            <Text fw={500} truncate>{arg.resource.title}</Text>
                            {visitCount > 0 && (
                              <Badge color="gray" variant="light" size="sm">
                                {visitCount} / {hourCount}h
                              </Badge>
                            )}
                          </Group>
                        );
                      }}
                      slotMinTime="08:00:00"
                      slotMaxTime="19:00:00"
                      slotDuration="01:00:00"
                      editable={!isSelectionModeActive} 
                      droppable={false} 
                      eventDrop={handleEventDrop}
                      eventContent={(arg) => (
                        <EventCard 
                          eventArg={arg}
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