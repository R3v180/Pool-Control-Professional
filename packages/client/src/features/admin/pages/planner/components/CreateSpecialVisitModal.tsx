// filename: packages/client/src/features/admin/pages/planner/components/CreateSpecialVisitModal.tsx
// version: 1.0.0 (NEW)
// description: Componente de modal extraído para manejar la creación de una Orden de Trabajo Especial. Encapsula su propio estado, formulario y lógica de envío.

import { Modal, Stack, Select, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import apiClient from '../../../../../api/apiClient';

interface TechnicianOption {
  value: string;
  label: string;
}

interface PoolOption {
  value: string;
  label: string;
}

interface CreateSpecialVisitModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  technicianOptions: TechnicianOption[];
  poolOptions: PoolOption[];
}

export function CreateSpecialVisitModal({
  opened,
  onClose,
  onSuccess,
  technicianOptions,
  poolOptions,
}: CreateSpecialVisitModalProps) {

  const form = useForm({
    initialValues: {
      poolId: '',
      technicianId: '',
      timestamp: new Date(),
    },
    validate: {
      poolId: (value) => (!value ? 'Debe seleccionar una piscina' : null),
      technicianId: (value) => (!value ? 'Debe asignar un técnico' : null),
      timestamp: (value) => (!value ? 'La fecha es obligatoria' : null),
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await apiClient.post('/visits/special', values);
      form.reset();
      onSuccess(); // Notifica al padre que la operación fue exitosa
    } catch (err) {
      form.setErrors({ poolId: 'Error al crear la orden especial.' });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Crear Orden de Trabajo Especial"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Piscina"
            placeholder='Busca o selecciona una piscina'
            data={poolOptions}
            searchable
            required
            {...form.getInputProps('poolId')}
          />
          <Select
            label="Asignar a"
            placeholder='Selecciona un técnico'
            data={technicianOptions}
            searchable
            required
            {...form.getInputProps('technicianId')}
          />
          <DatePickerInput
            label="Fecha y Hora"
            valueFormat="DD/MM/YYYY HH:mm"
            required
            {...form.getInputProps('timestamp')}
          />
          <Button type="submit" mt="md" loading={form.isDirty() && !form.isValid()}>
            Crear Visita
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}