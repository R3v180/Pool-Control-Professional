// filename: packages/client/src/features/admin/pages/planner/PlannerPage.tsx
// version: 9.4.3 (FIX: Resolve infinite render loop)
// description: Se corrige un bug que causaba un bucle de renderizado infinito. Se elimina el `useEffect` que llamaba a `gotoDate` y se refina la gestión del estado de la fecha para romper el ciclo.

import { useState, useMemo, useRef } from 'react';
import {
  Container, Title, Loader, Alert, Group, Button, Grid, Text, Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import esLocale from '@fullcalendar/core/locales/es'; 
import type { EventDropArg } from '@fullcalendar/core';

import { startOfWeek, addDays, subDays, format, getISOWeek, startOfToday } from 'date-fns';
import apiClient from '../../../../api/apiClient';
import './planner-styles.css';
import { ControlPanel } from './components/ControlPanel';
import { PendingWorkSidebar } from './components/PendingWorkSidebar';
import { BatchActionsToolbar } from './components/BatchActionsToolbar';
import { usePlannerData } from './hooks/usePlannerData';
import { CreateSpecialVisitModal } from './components/CreateSpecialVisitModal';
import { ReprogramModal } from './components/ReprogramModal';
import { EventCard } from './components/EventCard';

export function PlannerPage() {
  const calendarRef = useRef<FullCalendar>(null);
  // ✅ 1. Se restaura el estado 'week' y se mantiene 'activeDate'
  const [week, setWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeDate, setActiveDate] = useState(startOfToday());
  
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState('dayGridWeek');
  
  const [sidebarVersion, setSidebarVersion] = useState(0);

  const [specialVisitModalOpened, { open: openSpecialVisitModal, close: closeSpecialVisitModal }] = useDisclosure(false);
  const [reprogramModalOpened, { open: openReprogramModal, close: closeReprogramModal }] = useDisclosure(false);
  
  const [isSelectionModeActive, setSelectionModeActive] = useState(false);
  const [selectedVisitIds, setSelectedVisitIds] = useState(new Set<string>());

  // ✅ 2. El hook ahora solo depende de 'week' para cargar los datos semanales
  const { 
    events, 
    resources, 
    pools,
    zones, 
    workloadMap, 
    loading, 
    error,
    refetch,
  } = usePlannerData({ 
    week, 
    selectedTechnicians, 
    selectedZones, 
    sidebarVersion 
  });

  const technicianOptions = useMemo(() => resources.map(t => ({ value: t.id, label: t.title })), [resources]);
  const zoneOptions = useMemo(() => zones.map(z => ({ value: z.id, label: z.name })), [zones]);

  // ✅ 3. Se elimina el `useEffect` que causaba el bucle de renderizado
  
  const handleToggleSelectionMode = (isActive: boolean) => {
    setSelectionModeActive(isActive);
    if (!isActive) {
      setSelectedVisitIds(new Set());
    }
  };

  const handleVisitSelection = (visitId: string) => {
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
    closeReprogramModal();
    setSelectedVisitIds(new Set());
    if (isSelectionModeActive) {
      setSelectionModeActive(false);
    }
    refetch(); 
    setSidebarVersion(v => v + 1);
  };
  
  const handleDayClick = (arg: any) => {
    setActiveDate(arg.date);
    setViewMode('resourceTimelineDay');
  };

  const handleViewModeChange = (newMode: string) => {
    if (newMode === 'resourceTimelineDay' && viewMode !== 'resourceTimelineDay') {
        setActiveDate(startOfToday());
    }
    setViewMode(newMode);
  };

  const handlePrev = () => {
    if (viewMode === 'dayGridWeek') {
        setWeek(prev => subDays(prev, 7));
    } else {
        setActiveDate(prev => subDays(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'dayGridWeek') {
        setWeek(prev => addDays(prev, 7));
    } else {
        setActiveDate(prev => addDays(prev, 1));
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    if (isSelectionModeActive) {
      info.revert();
      return;
    }
    const { event, newResource } = info;
    const newDate = event.start;
    if (!newDate) return;
    
    const newTechnicianId = newResource ? newResource.id : event.extendedProps.technicianId;

    try {
      await apiClient.patch(`/visits/${event.id}/reschedule`, {
        timestamp: newDate.toISOString(),
        technicianId: newTechnicianId,
      });
      await refetch();
      setSidebarVersion(v => v + 1);
    } catch (err) {
      alert('Error al reprogramar la visita.');
      info.revert(); 
    }
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
      
      <ReprogramModal 
        opened={reprogramModalOpened}
        onClose={closeReprogramModal}
        onSuccess={handleBatchSuccess}
        selectedVisitIds={selectedVisitIds}
        allEvents={events}
        technicianOptions={technicianOptions}
      />
      
      <Group justify="space-between" align="center" my="lg">
        <Title order={2}>Planning Hub</Title>
        <Group>
          <Button onClick={openSpecialVisitModal} variant="light">Crear Orden Especial</Button>
          <Button.Group>
            <Button variant="default" onClick={handlePrev}>
                {viewMode === 'dayGridWeek' ? '< Semana Anterior' : '< Día Anterior'}
            </Button>
            <Button variant="default" onClick={handleNext}>
                {viewMode === 'dayGridWeek' ? 'Semana Siguiente >' : 'Día Siguiente >'}
            </Button>
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
        onViewModeChange={handleViewModeChange}
        isSelectionModeActive={isSelectionModeActive}
        onSelectionModeChange={handleToggleSelectionMode}
      />
      
      <Grid>
          <Grid.Col span={{ base: 12, lg: 3 }}>
              <PendingWorkSidebar 
                refreshKey={sidebarVersion} 
                selectedVisitIds={selectedVisitIds}
                onSelectVisit={handleVisitSelection}
              />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 9 }}>
              <FullCalendar
                  // ✅ Se usa una combinación de la semana (para semana) y el día (para equipo)
                  key={viewMode === 'dayGridWeek' ? getISOWeek(week) : format(activeDate, 'yyyy-MM-dd')}
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin, resourceTimelinePlugin]}
                  schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                  initialView={viewMode}
                  // ✅ La fecha inicial ahora depende de la vista
                  initialDate={viewMode === 'dayGridWeek' ? week : activeDate}
                  locales={[esLocale]}
                  locale="es"
                  firstDay={1}
                  headerToolbar={{
                    left: '',
                    center: 'title',
                    right: ''
                  }}
                  dateClick={handleDayClick}
                  titleFormat={ 
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
          </Grid.Col>
      </Grid>
      
      <BatchActionsToolbar 
        selectedCount={selectedVisitIds.size} 
        onClearSelection={handleClearSelection} 
        onReprogramClick={openReprogramModal}
      />
    </Container>
  );
}