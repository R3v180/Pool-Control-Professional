// filename: packages/client/src/features/admin/pages/ParameterCatalogPage.tsx
// Version: 1.2.0 (Implement TagsInput for SELECT options in the form)
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
  Select,
  TagsInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient.js';

// --- Tipos ---
const InputTypes = ['NUMBER', 'BOOLEAN', 'TEXT', 'SELECT'] as const;
type InputType = (typeof InputTypes)[number];

interface ParameterTemplate {
  id: string;
  name: string;
  unit: string | null;
  type: InputType;
  selectOptions: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function ParameterCatalogPage() {
  const [templates, setTemplates] = useState<ParameterTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTemplate, setEditingTemplate] = useState<ParameterTemplate | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      unit: '',
      type: 'NUMBER' as InputType,
      selectOptions: [] as string[],
    },
    validate: {
      name: (value: string) => (value.trim().length < 2 ? 'El nombre es demasiado corto' : null),
      type: (value: string) => (InputTypes.includes(value as InputType) ? null : 'Tipo inválido'),
      selectOptions: (value: string[], values) => {
        if (values.type === 'SELECT' && value.length === 0) {
          return 'Debe definir al menos una opción para el tipo SELECT';
        }
        return null;
      }
    },
  });

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<ParameterTemplate[]>>('/parameters');
      setTemplates(response.data.data);
    } catch (err) {
      setError('No se pudo cargar el catálogo de parámetros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template: ParameterTemplate | null = null) => {
    setEditingTemplate(template);
    if (template) {
      form.setValues({
        name: template.name,
        unit: template.unit || '',
        type: template.type,
        selectOptions: template.selectOptions || [],
      });
    } else {
      form.reset();
    }
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      ...values,
      selectOptions: values.type === 'SELECT' ? values.selectOptions : [],
    };
    try {
      if (editingTemplate) {
        await apiClient.patch(`/parameters/${editingTemplate.id}`, payload);
      } else {
        await apiClient.post('/parameters', payload);
      }
      await fetchTemplates();
      closeModal();
    } catch (err: any) {
      form.setErrors({ name: err.response?.data?.message || 'Error al guardar el parámetro' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este parámetro?')) {
      try {
        await apiClient.delete(`/parameters/${id}`);
        setTemplates((current) => current.filter((t) => t.id !== id));
      } catch (err) {
        // TODO: Mostrar notificación de error
        console.error('Failed to delete parameter', err);
      }
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const rows = templates.map((template) => (
    <Table.Tr key={template.id}>
      <Table.Td>{template.name}</Table.Td>
      <Table.Td>{template.unit || '-'}</Table.Td>
      <Table.Td>{template.type}</Table.Td>
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
        title={editingTemplate ? 'Editar Parámetro' : 'Crear Nuevo Parámetro'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Nombre del Parámetro" {...form.getInputProps('name')} />
            <TextInput label="Unidad (ej. ppm, pH, °C)" {...form.getInputProps('unit')} />
            <Select
              label="Tipo de Input"
              required
              data={InputTypes as unknown as string[]}
              {...form.getInputProps('type')}
            />
            {form.values.type === 'SELECT' && (
              <TagsInput
                label="Opciones del Select"
                placeholder="Añade opciones y presiona Enter"
                description="Escribe una opción y presiona Enter para añadirla a la lista."
                required
                {...form.getInputProps('selectOptions')}
              />
            )}
            <Button type="submit" mt="md">{editingTemplate ? 'Guardar Cambios' : 'Crear Parámetro'}</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Catálogo de Parámetros</Title>
          <Button onClick={() => handleOpenModal()}>Crear Nuevo Parámetro</Button>
        </Group>
        <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Unidad</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={4}>No hay parámetros definidos en el catálogo.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}