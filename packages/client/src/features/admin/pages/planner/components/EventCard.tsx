// filename: packages/client/src/features/admin/pages/planner/components/EventCard.tsx
// version: 1.2.0 (FEAT: Visually flag events that overlap with absences)
// description: La tarjeta ahora cambia su estilo (borde rojo, icono de advertencia) si detecta que la visita se ha asignado durante un periodo de ausencia del técnico.

import { Paper, Text, Badge, Checkbox, Tooltip, Stack, Divider, Group } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
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
  const { extendedProps, start, title } = event;

  // ✅ 1. Leer el nuevo flag de las props
  const isOverlapping = extendedProps.isOverlappingAbsence || false;

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
    // ✅ 2. Aplicar estilos de advertencia si hay superposición
    ...(isOverlapping && {
        border: `2px solid var(--mantine-color-red-7)`,
        opacity: 0.75,
    }),
  };

  const tooltipLabel = (
    <Stack gap="xs">
      <Text fw={700}>{title}</Text>
      <Text size="sm">Cliente: {extendedProps.clientName}</Text>
      <Text size="sm">Dirección: {extendedProps.poolAddress}</Text>
      <Divider />
      <Text size="sm">Fecha: {format(start!, 'eeee, d MMMM', { locale: es })}</Text>
      <Text size="sm">Técnico: {extendedProps.technicianName}</Text>
      <Badge size="sm" variant="light" color={extendedProps.status === 'COMPLETED' ? 'green' : 'blue'}>
        Estado: {extendedProps.status}
      </Badge>
      {isOverlapping && (
        <Badge color="red" leftSection={<IconAlertTriangleFilled size={14} />} mt="xs">
            Conflicto de Horario
        </Badge>
      )}
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
        
        {/* ✅ 3. Añadir un icono de advertencia visible en la tarjeta */}
        <Group justify="space-between" wrap="nowrap" gap="xs">
            <Text size="xs" fw={700} truncate>{title}</Text>
            {isOverlapping && <IconAlertTriangleFilled size={14} style={{ color: 'var(--mantine-color-red-7)', flexShrink: 0 }} />}
        </Group>

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