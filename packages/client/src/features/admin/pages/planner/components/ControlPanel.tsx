// filename: packages/client/src/features/admin/pages/planner/components/ControlPanel.tsx
// version: 2.1.0 (FEAT: Add 'Unassigned' option to technician filter)
// description: Se añade una opción virtual "Sin Asignar" al filtro de técnicos para permitir al usuario buscar y gestionar visitas que no tienen ningún técnico asignado.

import { Grid, MultiSelect, SegmentedControl, Group, Switch } from '@mantine/core';

// --- Tipos de Datos ---
interface SelectOption {
  value: string;
  label: string;
}

interface ControlPanelProps {
  technicianOptions: SelectOption[];
  zoneOptions: SelectOption[];
  selectedTechnicians: string[];
  selectedZones: string[];
  onTechnicianChange: (selected: string[]) => void;
  onZoneChange: (selected: string[]) => void;
  viewMode: string;
  onViewModeChange: (value: string) => void;
  isSelectionModeActive: boolean;
  onSelectionModeChange: (isActive: boolean) => void;
}

// ✅ 1. Definir la opción virtual para el filtro
const UNASSIGNED_OPTION: SelectOption = {
  value: 'unassigned', // Esta clave será reconocida por el backend
  label: '🔴 Sin Asignar',
};

// --- Componente ---
export function ControlPanel({
  technicianOptions,
  zoneOptions,
  selectedTechnicians,
  selectedZones,
  onTechnicianChange,
  onZoneChange,
  viewMode,
  onViewModeChange,
  isSelectionModeActive,
  onSelectionModeChange,
}: ControlPanelProps) {
  return (
    <Grid align="flex-end" mb="xl" justify="space-between">
      {/* Grupo de Filtros */}
      <Grid.Col span={{ base: 12, md: 'auto' }}>
        <Group>
          <MultiSelect
            label="Filtrar por Técnicos"
            placeholder="Todos los técnicos"
            // ✅ 2. Añadir la opción "Sin Asignar" al principio de la lista
            data={[UNASSIGNED_OPTION, ...technicianOptions]}
            value={selectedTechnicians}
            onChange={onTechnicianChange}
            searchable
            clearable
          />
          <MultiSelect
            label="Filtrar por Zonas"
            placeholder="Todas las zonas"
            data={zoneOptions}
            value={selectedZones}
            onChange={onZoneChange}
            searchable
            clearable
          />
        </Group>
      </Grid.Col>

      {/* Grupo de Vistas y Acciones */}
      <Grid.Col span={{ base: 12, md: 'auto' }}>
        <Group>
          <Switch
            label="Modo Selección"
            checked={isSelectionModeActive}
            onChange={(event) => onSelectionModeChange(event.currentTarget.checked)}
            size="lg"
            onLabel="ON"
            offLabel="OFF"
          />
          <SegmentedControl
            value={viewMode}
            onChange={onViewModeChange}
            data={[
              { label: 'Semana', value: 'dayGridWeek' },
              { label: 'Equipo', value: 'resourceTimelineDay' },
            ]}
          />
        </Group>
      </Grid.Col>
    </Grid>
  );
}