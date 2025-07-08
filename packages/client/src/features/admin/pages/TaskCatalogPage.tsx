// filename: packages/client/src/features/admin/pages/TaskCatalogPage.tsx
// Version: 1.0.0 (Initial implementation of the task template catalog page with full CRUD)
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
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient.js';

// --- Tipos ---
interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function TaskCatalogPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value: string) => (value.trim().length < 2 ? 'El nombre es demasiado corto' : null),
    },
  });

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<TaskTemplate[]>>('/tasks');
      setTemplates(response.data.data);
    } catch (err) {
      setError('No se pudo cargar el catálogo de tareas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template: TaskTemplate | null = null) => {
    setEditingTemplate(template);
    if (template) {
      form.setValues({
        name: template.name,
        description: template.description || '',
      });
    } else {
      form.reset();
    }
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingTemplate) {
        await apiClient.patch(`/tasks/${editingTemplate.id}`, values);
      } else {
        await apiClient.post('/tasks', values);
      }
      await fetchTemplates();
      closeModal();
    } catch (err: any) {
      form.setErrors({ name: err.response?.data?.message || 'Error al guardar la tarea' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await apiClient.delete(`/tasks/${id}`);
        setTemplates((current) => current.filter((t) => t.id !== id));
      } catch (err) {
        // TODO: Mostrar notificación de error
        console.error('Failed to delete task', err);
      }
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const rows = templates.map((template) => (
    <Table.Tr key={template.id}>
      <Table.Td>{template.name}</Table.Td>
      <Table.Td>{template.description || '-'}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button variant="subtle" size="xs" onClick={() => handleOpenModal(template)}>Editar</Button>
          <Button variant="subtle" size="xs" color="red" onClick={() => handleDelete(template.id)}>Eliminar</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingTemplate ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Nombre de la Tarea" {...form.getInputProps('name')} />
            <Textarea label="Descripción (opcional)" {...form.getInputProps('description')} />
            <Button type="submit" mt="md">{editingTemplate ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Catálogo de Tareas</Title>
          <Button onClick={() => handleOpenModal()}>Crear Nueva Tarea</Button>
        </Group>
        <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={3}>No hay tareas definidas en el catálogo.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}