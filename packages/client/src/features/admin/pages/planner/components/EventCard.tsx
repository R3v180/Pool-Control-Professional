// filename: packages/client/src/features/admin/pages/planner/components/EventCard.tsx
// version: 1.0.0 (NEW)
// description: Componente extraído para renderizar una tarjeta de visita individual en el calendario del Planning Hub.

import { Paper, Text, Badge, Checkbox, Tooltip, Stack, Divider } from '@mantine/core';
import type { EventContentArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventCardProps {
  eventArg: EventContentArg;
  isSelectionModeActive: boolean;
  isSelected: boolean;
  onSelect: (visitId: string) => void;
}

export function EventCard({ eventArg, isSelectionModeActive, isSelected, onSelect }: EventCardProps) {
  const { event } = eventArg;
  const { extendedProps, start } = event;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionModeActive) {
      e.preventDefault(); 
      e.stopPropagation();
      onSelect(event.id);
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

  const tooltipLabel = (
    <Stack gap="xs">
      <Text fw={700}>{event.title}</Text>
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
    <Tooltip label={tooltipLabel} withArrow position="bottom" openDelay={500} multiline w={250}>
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
            aria-label="Seleccionar visita"
          />
        )}
        <Text size="xs" fw={700} truncate>{event.title}</Text>
        <Text size="xs" c="dimmed" truncate>{extendedProps.clientName}</Text>
        {extendedProps.technicianName && ( 
          <Badge variant="light" color="gray" size="xs" mt={4} style={{ textTransform: 'none' }}> 
            {extendedProps.technicianName} 
          </Badge> 
        )}
      </Paper>
    </Tooltip>
  );
}