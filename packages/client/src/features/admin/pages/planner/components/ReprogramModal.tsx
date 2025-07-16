// filename: packages/client/src/features/admin/pages/planner/components/ReprogramModal.tsx
// version: 1.0.1 (FIX: Handle null timestamp and ensure Date object)
// description: Se corrige el error que ocurría al reasignar un técnico sin cambiar la fecha. La lógica ahora maneja correctamente los valores nulos y se asegura de que la fecha sea un objeto Date antes de usar sus métodos.

import { Modal, Stack, Select, Button } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import 'dayjs/locale/es';
import { useForm } from '@mantine/form';
import apiClient from '../../../../../api/apiClient';
import type { CalendarEvent } from '../types';

interface TechnicianOption {
  value: string;
  label: string;
}

interface ReprogramModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedVisitIds: Set<string>;
  allEvents: CalendarEvent[];
  technicianOptions: TechnicianOption[];
}

export function ReprogramModal({
  opened,
  onClose,
  onSuccess,
  selectedVisitIds,
  allEvents,
  technicianOptions,
}: ReprogramModalProps) {
  
  const form = useForm({
    initialValues: {
      newTechnicianId: '',
      newTimestamp: null as Date | null,
    },
    validate: (values) => {
      if (!values.newTechnicianId && !values.newTimestamp) {
        return { 
          newTechnicianId: 'Debe asignar un técnico o una nueva fecha.',
          newTimestamp: 'Debe asignar un técnico o una nueva fecha.',
         };
      }
      return {};
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    const promises = Array.from(selectedVisitIds).map(visitId => {
      const eventToReprogram = allEvents.find(e => e.id === visitId);
      if (!eventToReprogram) return Promise.resolve(); 

      const technicianId = values.newTechnicianId || eventToReprogram.extendedProps.technicianId;
      
      // ✅ LÓGICA CORREGIDA Y ROBUSTA
      let timestamp;
      if (values.newTimestamp) {
        // Nos aseguramos de que sea un objeto Date antes de formatearlo
        timestamp = new Date(values.newTimestamp).toISOString();
      } else {
        // Si no se proporciona nueva fecha, mantenemos la original
        timestamp = eventToReprogram.start.toISOString();
      }

      return apiClient.patch(`/visits/${visitId}/reschedule`, {
        timestamp,
        technicianId,
      });
    });

    try {
      await Promise.all(promises);
      form.reset();
      onSuccess();
    } catch (err) {
      console.error("Error en la reprogramación en lote", err);
      form.setErrors({ newTechnicianId: 'Error al reprogramar las visitas.' });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={`Reprogramar ${selectedVisitIds.size} visita(s)`}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select 
            label="Nuevo técnico (opcional)"
            placeholder='Mantener técnico actual'
            data={technicianOptions}
            searchable
            clearable
            {...form.getInputProps('newTechnicianId')}
          />
          <DateTimePicker
            label="Nueva fecha y hora (opcional)"
            placeholder="Mantener fecha actual"
            locale="es"
            clearable
            {...form.getInputProps('newTimestamp')}
          />
          <Button type="submit" mt="md" loading={form.isDirty() && !form.isValid()}>
            Confirmar Reprogramación
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}