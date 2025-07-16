// filename: packages/client/src/features/admin/pages/planning/AvailabilityPage.tsx
// version: 1.0.1 (FIXED)
// description: Se elimina la importación no utilizada 'es' de 'date-fns/locale'.

import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Table,
  Loader,
  Alert,
  Button,
  Modal,
  Stack,
  Text,
  Group,
  Paper,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../../api/apiClient';
import { format } from 'date-fns';
// ✅ CORRECCIÓN: Se elimina la importación de 'es' que no se estaba utilizando.

// --- Tipos de Datos ---
interface Technician {
  id: string;
  name: string;
  isAvailable: boolean;
}

interface UserAvailability {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

// --- Componente Principal ---
export function AvailabilityPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [availabilities, setAvailabilities] = useState<UserAvailability[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      dateRange: [null, null] as [Date | null, Date | null],
      reason: '',
    },
    validate: {
      dateRange: (value) => (value[0] === null || value[1] === null ? 'Debe seleccionar un rango de fechas' : null),
    },
  });

  const fetchTechnicians = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/users/technicians');
      setTechnicians(response.data.data);
    } catch (err) {
      setError('No se pudo cargar la lista de técnicos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleOpenModal = async (technician: Technician) => {
    setSelectedTechnician(technician);
    try {
      const response = await apiClient.get(`/users/${technician.id}/availabilities`);
      setAvailabilities(response.data.data);
      openModal();
    } catch (err) {
      setError('No se pudieron cargar las ausencias de este técnico.');
    }
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedTechnician(null);
    setAvailabilities([]);
    form.reset();
  };

  const handleSubmitAbsence = async (values: typeof form.values) => {
    if (!selectedTechnician || !values.dateRange[0] || !values.dateRange[1]) return;

    try {
      const payload = {
        userId: selectedTechnician.id,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        reason: values.reason,
      };
      await apiClient.post('/users/availability', payload);
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar la ausencia.');
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const rows = technicians.map((tech) => (
    <Table.Tr key={tech.id}>
      <Table.Td>{tech.name}</Table.Td>
      <Table.Td>
        <Button variant="outline" size="xs" onClick={() => handleOpenModal(tech)}>
          Gestionar Ausencias
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={`Gestionar Ausencias de ${selectedTechnician?.name || ''}`}
        size="lg"
        centered
      >
        <Stack>
          <Paper withBorder p="md">
            <Title order={4} mb="md">Añadir Nueva Ausencia</Title>
            <form onSubmit={form.onSubmit(handleSubmitAbsence)}>
              <Stack>
                <DatePickerInput
                  type="range"
                  label="Periodo de Ausencia"
                  placeholder="Desde - Hasta"
                  required
                  {...form.getInputProps('dateRange')}
                />
                <TextInput
                  label="Motivo (Opcional)"
                  placeholder="Ej: Vacaciones, Baja Médica"
                  {...form.getInputProps('reason')}
                />
                <Button type="submit" mt="md">Guardar Ausencia</Button>
              </Stack>
            </form>
          </Paper>

          <Paper withBorder p="md">
            <Title order={4} mb="md">Ausencias Programadas</Title>
            <Stack>
              {availabilities.length > 0 ? (
                availabilities.map((item) => (
                  <Paper key={item.id} p="xs" withBorder shadow="xs">
                    <Group justify="space-between">
                      <Text>
                        Del {format(new Date(item.startDate), 'dd/MM/yyyy')} al {format(new Date(item.endDate), 'dd/MM/yyyy')}
                      </Text>
                      <Text c="dimmed">{item.reason || 'Sin motivo'}</Text>
                    </Group>
                  </Paper>
                ))
              ) : (
                <Text c="dimmed">Este técnico no tiene ausencias programadas.</Text>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Modal>

      <Container fluid>
        <Title order={2} my="lg">Gestión de Disponibilidad del Equipo</Title>
        <Table striped withTableBorder mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre del Técnico</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}