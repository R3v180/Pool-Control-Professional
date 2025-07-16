// filename: packages/client/src/features/admin/pages/planner/components/PendingWorkSidebar.tsx
// version: 4.0.2 (FIX: Restore missing export statement)
// description: Se vuelve a añadir la palabra clave 'export' a la función principal del componente para que pueda ser importada correctamente en otras partes de la aplicación.

import { useEffect, useState } from 'react';
import { Stack, Title, Paper, Text, Badge, ScrollArea, Loader, Alert, Accordion, Group, Checkbox } from '@mantine/core';
import apiClient from '../../../../../api/apiClient';
import { useDndStore } from '../../../../../stores/dnd.store';

// --- Tipos ---
interface Visit {
  id: string;
  timestamp: string;
  pool: { name: string; client: { name: string } };
  technician: { name: string } | null;
}

interface PendingWorkData {
  overdueVisits: Visit[];
  orphanedVisits: Visit[];
}

interface VisitItemProps {
  visit: Visit;
  isOverdue?: boolean;
  isSelectionModeActive: boolean;
  isSelected: boolean;
  onSelect: (visitId: string) => void;
}

// --- Componente Interno Simple para la UI ---
const VisitItem = ({ visit, isOverdue, isSelectionModeActive, isSelected, onSelect }: VisitItemProps) => {
  const overdueLabel = isOverdue
    ? `Visita Vencida`
    : `Técnico: ${visit.technician?.name || 'No disponible'}`;
  
  const setDraggingVisit = useDndStore((state) => state.setDraggingVisit);

  const handleDragStart = () => {
    if (!isSelectionModeActive) {
      setDraggingVisit(visit);
    }
  };

  const handleDragEnd = () => {
    setDraggingVisit(null);
  };

  const handleItemClick = () => {
    if (isSelectionModeActive) {
      onSelect(visit.id);
    }
  };

  const paperStyle: React.CSSProperties = {
    cursor: isSelectionModeActive ? 'pointer' : 'grab',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...(isSelected && {
      transform: 'scale(0.97)',
      boxShadow: `0 0 0 2px var(--mantine-color-blue-5)`,
      backgroundColor: 'var(--mantine-color-blue-0)',
    }),
  };

  return (
    <Paper
      draggable={!isSelectionModeActive}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      withBorder 
      p="xs" 
      radius="sm" 
      mb="xs"
      style={paperStyle}
      onClick={handleItemClick}
    >
      {isSelectionModeActive && (
        <Checkbox
          checked={isSelected}
          onChange={() => { /* el onChange se maneja en el onClick del Paper */ }}
          style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 10 }}
        />
      )}
      <Stack style={{ paddingLeft: isSelectionModeActive ? '30px' : '0' }}>
        <Text fw={500} size="sm">{visit.pool.name}</Text>
        <Text c="dimmed" size="xs">{visit.pool.client.name}</Text>
        <Group justify="space-between" mt={4}>
          <Text c="red" size="xs" mt={2}>{overdueLabel}</Text>
          {!isSelectionModeActive && <Badge variant="light" color="gray">Arrastrar</Badge>}
        </Group>
      </Stack>
    </Paper>
  );
};

interface PendingWorkSidebarProps {
  refreshKey: number;
  isSelectionModeActive: boolean;
  selectedVisitIds: Set<string>;
  onSelectVisit: (visitId: string) => void;
}

// --- Componente Principal ---
// ✅ CORRECCIÓN: Se añade la palabra 'export' que faltaba
export function PendingWorkSidebar({ refreshKey, isSelectionModeActive, selectedVisitIds, onSelectVisit }: PendingWorkSidebarProps) {
  const [data, setData] = useState<PendingWorkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingWork = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/planning/pending-work');
        setData(response.data.data);
      } catch (err) {
        setError('No se pudo cargar el trabajo pendiente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingWork();
  }, [refreshKey]);

  if (isLoading) return <Loader />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const renderVisitList = (visits: Visit[], isOverdue: boolean) => (
    visits.length > 0 ? (
      visits.map((visit) => (
        <VisitItem
          key={visit.id}
          visit={visit}
          isOverdue={isOverdue}
          isSelectionModeActive={isSelectionModeActive}
          isSelected={selectedVisitIds.has(visit.id)}
          onSelect={onSelectVisit}
        />
      ))
    ) : (
      <Text size="sm" c="dimmed">{isOverdue ? '¡Todo al día!' : 'No hay trabajo sin asignar.'}</Text>
    )
  );

  return (
    <Stack>
      <Title order={4}>Muelle de Carga</Title>
        <ScrollArea style={{ height: 'calc(100vh - 250px)' }}>
          <Accordion variant="separated" defaultValue={['overdue', 'orphaned']} multiple>
            <Accordion.Item value="overdue">
              <Accordion.Control>
                <Group>
                  <Text>Deuda Operativa</Text>
                  {data && data.overdueVisits.length > 0 && <Badge color="red">{data.overdueVisits.length}</Badge>}
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                {renderVisitList(data?.overdueVisits || [], true)}
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="orphaned">
              <Accordion.Control>
                <Group>
                  <Text>Trabajo Huérfano</Text>
                  {data && data.orphanedVisits.length > 0 && <Badge color="gray">{data.orphanedVisits.length}</Badge>}
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                {renderVisitList(data?.orphanedVisits || [], false)}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </ScrollArea>
    </Stack>
  );
}