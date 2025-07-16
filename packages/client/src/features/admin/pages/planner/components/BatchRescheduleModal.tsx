// filename: packages/client/src/features/admin/pages/planner/components/BatchRescheduleModal.tsx
// version: 1.0.0 (NEW)
// description: Componente de modal extraído para manejar el cambio de fecha en lote de las visitas seleccionadas.

import { Modal, Stack, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import apiClient from '../../../../../api/apiClient';
import type { CalendarEvent } from '../types';

interface BatchRescheduleModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedVisitIds: Set<string>;
  allEvents: CalendarEvent[];
}

export function BatchRescheduleModal({
  opened,
  onClose,
  onSuccess,
  selectedVisitIds,
  allEvents,
}: BatchRescheduleModalProps) {
  
  const form = useForm({
    initialValues: { newDate: null as Date | null },
    validate: {
      newDate: (value) => (!value ? 'Debe seleccionar una fecha' : null),
    }
  });

  const handleSubmit = async (values: { newDate: Date | null }) => {
    if (!values.newDate) return;
    
    const promises = Array.from(selectedVisitIds).map(visitId => {
      const eventToReschedule = allEvents.find(e => e.id === visitId);
      if (!eventToReschedule) return Promise.resolve();
      
      const newDateObject = new Date(values.newDate!);

      return apiClient.patch(`/visits/${visitId}/reschedule`, {
        timestamp: newDateObject.toISOString(),
        technicianId: eventToReschedule.extendedProps.technicianId,
      });
    });

    try {
      await Promise.all(promises);
      form.reset();
      onSuccess();
    } catch (err) {
      console.error("Error en el cambio de fecha en lote", err);
      form.setErrors({ newDate: 'Error al cambiar la fecha.' });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={`Mover ${selectedVisitIds.size} visitas`}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <DatePickerInput
            label="Seleccione la nueva fecha"
            placeholder="Elige una fecha"
            required
            {...form.getInputProps('newDate')}
          />
          <Button type="submit" mt="md" loading={form.isDirty() && !form.isValid()}>
            Confirmar Cambio de Fecha
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}