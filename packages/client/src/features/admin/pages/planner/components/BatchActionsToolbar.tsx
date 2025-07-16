// filename: packages/client/src/features/admin/pages/planner/components/BatchActionsToolbar.tsx
// version: 1.2.0 (FEAT: Enable reschedule action button)
// description: Se habilita el botón "Cambiar Fecha" y se le conecta una nueva prop `onRescheduleClick` para invocar la acción desde el componente padre.

import { Paper, Text, Group, Button } from '@mantine/core';

interface BatchActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onReassignClick: () => void;
  onRescheduleClick: () => void; // ✅ Nueva prop para la acción de cambiar fecha
}

export function BatchActionsToolbar({
  selectedCount,
  onClearSelection,
  onReassignClick,
  onRescheduleClick, // ✅ Prop recibida
}: BatchActionsToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    padding: '12px 24px',
    borderRadius: 'var(--mantine-radius-xl)',
    boxShadow: 'var(--mantine-shadow-xl)',
  };

  return (
    <Paper withBorder style={toolbarStyle}>
      <Group justify="space-between" align="center">
        <Text fw={700} size="md" c="blue">
          {selectedCount} {selectedCount > 1 ? 'visitas seleccionadas' : 'visita seleccionada'}
        </Text>
        
        <Group>
          <Button variant="light" onClick={onReassignClick}>Reasignar Técnico</Button>
          {/* ✅ Botón habilitado y conectado a la nueva prop */}
          <Button variant="light" onClick={onRescheduleClick}>Cambiar Fecha</Button>
        </Group>

        <Button variant="subtle" color="gray" onClick={onClearSelection}>
          Deseleccionar todo
        </Button>
      </Group>
    </Paper>
  );
}