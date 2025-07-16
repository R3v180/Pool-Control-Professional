// filename: packages/client/src/features/admin/pages/planner/components/BatchReassignModal.tsx
// version: 1.0.0 (NEW)
// description: Componente de modal extraído para manejar la reasignación en lote de visitas a un nuevo técnico.

import { Modal, Stack, Select, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import apiClient from '../../../../../api/apiClient';
import type { CalendarEvent } from '../types'; // Crearemos este fichero de tipos en el siguiente paso para una mayor limpieza

interface TechnicianOption {
  value: string;
  label: string;
}

interface BatchReassignModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedVisitIds: Set<string>;
  allEvents: CalendarEvent[];
  technicianOptions: TechnicianOption[];
}

export function BatchReassignModal({
  opened,
  onClose,
  onSuccess,
  selectedVisitIds,
  allEvents,
  technicianOptions,
}: BatchReassignModalProps) {
  
  const form = useForm({
    initialValues: { newTechnicianId: '' },
    validate: {
      newTechnicianId: (value) => (!value ? 'Debe seleccionar un técnico' : null),
    }
  });

  const handleSubmit = async (values: { newTechnicianId: string }) => {
    const promises = Array.from(selectedVisitIds).map(visitId => {
      const eventToReassign = allEvents.find(e => e.id === visitId);
      if (!eventToReassign) return Promise.resolve(); 

      return apiClient.patch(`/visits/${visitId}/reschedule`, {
        timestamp: eventToReassign.start.toISOString(),
        technicianId: values.newTechnicianId,
      });
    });

    try {
      await Promise.all(promises);
      form.reset();
      onSuccess();
    } catch (err) {
      console.error("Error en la reasignación en lote", err);
      form.setErrors({ newTechnicianId: 'Error al reasignar las visitas.' });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={`Reasignar ${selectedVisitIds.size} visitas`}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select 
            label="Seleccione el nuevo técnico"
            placeholder='Selecciona un técnico de la lista'
            data={technicianOptions}
            searchable
            required
            {...form.getInputProps('newTechnicianId')}
          />
          <Button type="submit" mt="md" loading={form.isDirty() && !form.isValid()}>
            Confirmar Reasignación
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}