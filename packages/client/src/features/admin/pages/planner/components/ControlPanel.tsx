// filename: packages/client/src/features/admin/pages/planner/components/ControlPanel.tsx
// version: 2.0.0 (FEAT: Add selection mode switch)
// description: Se añade el interruptor (Switch) para activar/desactivar el "Modo Selección" en el Planning Hub.

import { Grid, MultiSelect, SegmentedControl, Group, Switch } from '@mantine/core';

// --- Tipos de Datos ---
interface SelectOption {
  value: string;
  label: string;
}

// ✅ 1. Actualizar la interfaz de props para incluir los nuevos controles
interface ControlPanelProps {
  technicianOptions: SelectOption[];
  zoneOptions: SelectOption[];
  selectedTechnicians: string[];
  selectedZones: string[];
  onTechnicianChange: (selected: string[]) => void;
  onZoneChange: (selected: string[]) => void;
  viewMode: string;
  onViewModeChange: (value: string) => void;
  // Nuevas props para el modo selección
  isSelectionModeActive: boolean;
  onSelectionModeChange: (isActive: boolean) => void;
}

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
  isSelectionModeActive, // <-- Nueva prop recibida
  onSelectionModeChange, // <-- Nueva prop recibida
}: ControlPanelProps) {
  return (
    <Grid align="flex-end" mb="xl" justify="space-between">
      {/* Grupo de Filtros */}
      <Grid.Col span={{ base: 12, md: 'auto' }}>
        <Group>
          <MultiSelect
            label="Filtrar por Técnicos"
            placeholder="Todos los técnicos"
            data={technicianOptions}
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
          {/* ✅ 2. Añadir el nuevo Switch para el "Modo Selección" */}
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