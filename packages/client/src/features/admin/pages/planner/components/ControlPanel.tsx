// filename: packages/client/src/features/admin/pages/planner/components/ControlPanel.tsx
// version: 1.1.0 (FEAT: Add view mode switcher)

import { Grid, MultiSelect, SegmentedControl, Group } from '@mantine/core';

// --- Tipos de Datos ---
interface SelectOption {
  value: string;
  label: string;
}

interface ControlPanelProps {
  // Props existentes
  technicianOptions: SelectOption[];
  zoneOptions: SelectOption[];
  selectedTechnicians: string[];
  selectedZones: string[];
  onTechnicianChange: (selected: string[]) => void;
  onZoneChange: (selected: string[]) => void;
  // Nuevas props para el cambio de vista
  viewMode: string;
  onViewModeChange: (value: string) => void;
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
}: ControlPanelProps) {
  return (
    <Grid align="flex-end" mb="xl" justify="space-between">
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
      <Grid.Col span={{ base: 12, md: 'auto' }}>
        <SegmentedControl
          value={viewMode}
          onChange={onViewModeChange}
          data={[
            { label: 'Semana', value: 'dayGridWeek' },
            { label: 'Equipo', value: 'resourceTimelineDay' },
          ]}
        />
      </Grid.Col>
    </Grid>
  );
}