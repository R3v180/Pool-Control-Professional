// filename: packages/client/src/features/admin/pages/planner/components/BatchActionsToolbar.tsx
// version: 2.0.0 (REFACTOR: Unify action buttons)
// description: Se unifican los botones de acción en uno solo, "Reprogramar Visitas", que abrirá un modal unificado para gestionar tanto el técnico como la fecha.

import { Paper, Text, Group, Button } from '@mantine/core';

interface BatchActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onReprogramClick: () => void; // ✅ Prop unificada para la acción principal
}

export function BatchActionsToolbar({
  selectedCount,
  onClearSelection,
  onReprogramClick,
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
        
        {/* ✅ Grupo de acciones ahora tiene un único botón principal */}
        <Group>
          <Button variant="light" onClick={onReprogramClick}>
            Reprogramar Visitas
          </Button>
          {/* Aquí se podrían añadir más acciones en el futuro, como "Eliminar en Lote" */}
        </Group>

        <Button variant="subtle" color="gray" onClick={onClearSelection}>
          Deseleccionar todo
        </Button>
      </Group>
    </Paper>
  );
}