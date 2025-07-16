// filename: packages/client/src/features/admin/pages/planner/components/PendingWorkSidebar.tsx
// version: 3.0.0 (REFACTOR: Use Zustand store for drag state)
// description: Se elimina la API Draggable de FullCalendar y se utiliza un store de Zustand para gestionar el estado del elemento arrastrado, preparando el terreno para una gestión manual del drop.

import { useEffect, useState } from 'react';
import { Stack, Title, Paper, Text, Badge, ScrollArea, Loader, Alert, Accordion, Group } from '@mantine/core';
import apiClient from '../../../../../api/apiClient';
import { useDndStore } from '../../../../../stores/dnd.store'; // ✅ 1. Importar el nuevo store.

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

// --- Componente Interno Simple para la UI ---
const VisitItem = ({ visit, isOverdue }: { visit: Visit; isOverdue?: boolean }) => {
  const overdueLabel = isOverdue
    ? `Visita Vencida`
    : `Técnico: ${visit.technician?.name || 'No disponible'}`;
  
  // ✅ 2. Importar la función para actualizar el store.
  const setDraggingVisit = useDndStore((state) => state.setDraggingVisit);

  const handleDragStart = () => {
    console.log('--- 🔵 [Sidebar] Drag Start:', visit);
    setDraggingVisit(visit); // Al empezar a arrastrar, guardamos la visita en el store.
  };

  const handleDragEnd = () => {
    console.log('--- 🔵 [Sidebar] Drag End');
    setDraggingVisit(null); // Al soltar (incluso si es fuera del calendario), limpiamos el store.
  };

  return (
    // ✅ 3. Usamos los eventos nativos de React para el drag & drop.
    <Paper 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      withBorder 
      p="xs" 
      radius="sm" 
      mb="xs"
      style={{ cursor: 'grab' }}
    >
      <Text fw={500} size="sm">{visit.pool.name}</Text>
      <Text c="dimmed" size="xs">{visit.pool.client.name}</Text>
      <Group justify="space-between" mt={4}>
        <Text c="red" size="xs" mt={2}>{overdueLabel}</Text>
        <Badge variant="light" color="gray">Arrastrar</Badge>
      </Group>
    </Paper>
  );
};

// --- Componente Principal ---
export function PendingWorkSidebar({ refreshKey }: { refreshKey: number }) {
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

  return (
    <Stack>
      <Title order={4}>Muelle de Carga</Title>
        <ScrollArea style={{ height: 'calc(100vh - 250px)' }}>
          <Accordion variant="separated" defaultValue="overdue">
            <Accordion.Item value="overdue">
              <Accordion.Control>
                <Text>Deuda Operativa</Text>
                {data && data.overdueVisits.length > 0 && <Badge color="red">{data.overdueVisits.length}</Badge>}
              </Accordion.Control>
              <Accordion.Panel>
                {data?.overdueVisits.length ? (
                  data.overdueVisits.map((visit) => <VisitItem key={visit.id} visit={visit} isOverdue />)
                ) : (
                  <Text size="sm" c="dimmed">¡Todo al día!</Text>
                )}
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="orphaned">
              <Accordion.Control>
                <Text>Trabajo Huérfano</Text>
                {data && data.orphanedVisits.length > 0 && <Badge color="gray">{data.orphanedVisits.length}</Badge>}
              </Accordion.Control>
              <Accordion.Panel>
                {data?.orphanedVisits.length ? (
                  data.orphanedVisits.map((visit) => <VisitItem key={visit.id} visit={visit} />)
                ) : (
                  <Text size="sm" c="dimmed">No hay trabajo sin asignar.</Text>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </ScrollArea>
    </Stack>
  );
}