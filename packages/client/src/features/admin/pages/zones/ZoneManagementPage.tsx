// filename: packages/client/src/features/admin/pages/zones/ZoneManagementPage.tsx
// version: 1.0.0
// description: Página para la gestión completa (CRUD) del catálogo de Zonas Geográficas.

import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Table,
  Loader,
  Alert,
  Button,
  Group,
  Modal,
  TextInput,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../../api/apiClient';

// --- Tipos de Datos ---
interface Zone {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente Principal ---
export function ZoneManagementPage() {
  // --- Estados del Componente ---
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  // --- Formulario (Mantine Form) ---
  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'El nombre de la zona es demasiado corto.' : null),
    },
  });

  // --- Lógica de Datos (API Calls) ---
  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<Zone[]>>('/zones');
      setZones(response.data.data);
    } catch (err) {
      setError('No se pudo cargar el catálogo de zonas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // --- Manejadores de Eventos ---
  const handleOpenModal = (zone: Zone | null = null) => {
    setEditingZone(zone);
    if (zone) {
      form.setValues({ name: zone.name });
    } else {
      form.reset();
    }
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingZone) {
        await apiClient.patch(`/zones/${editingZone.id}`, values);
      } else {
        await apiClient.post('/zones', values);
      }
      await fetchZones();
      closeModal();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al guardar la zona.';
      form.setErrors({ name: errorMessage });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta zona?')) {
      try {
        await apiClient.delete(`/zones/${id}`);
        // Actualización optimista de la UI
        setZones((current) => current.filter((z) => z.id !== id));
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'No se pudo eliminar la zona.';
        alert(errorMessage); // Mostramos el error específico del backend
      }
    }
  };

  // --- Renderizado del Componente ---
  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const rows = zones.map((zone) => (
    <Table.Tr key={zone.id}>
      <Table.Td>{zone.name}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button variant="subtle" size="xs" onClick={() => handleOpenModal(zone)}>Editar</Button>
          <Button variant="subtle" size="xs" color="red" onClick={() => handleDelete(zone.id)}>Eliminar</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingZone ? 'Editar Zona' : 'Crear Nueva Zona'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Nombre de la Zona" placeholder="Ej: Arenal" {...form.getInputProps('name')} />
            <Button type="submit" mt="md">{editingZone ? 'Guardar Cambios' : 'Crear Zona'}</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Gestión de Zonas Geográficas</Title>
          <Button onClick={() => handleOpenModal()}>Crear Nueva Zona</Button>
        </Group>
        <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={2}>No hay zonas definidas en el catálogo.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}