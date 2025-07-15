// filename: packages/client/src/features/admin/pages/ProductCategoryCatalogPage.tsx
// version: 1.0.0
// description: Página para la gestión CRUD del catálogo de categorías de productos.

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
import apiClient from '../../../api/apiClient';

// --- Tipos de Datos ---
interface ProductCategory {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente Principal ---
export function ProductCategoryCatalogPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'El nombre de la categoría es demasiado corto.' : null),
    },
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<ProductCategory[]>>('/product-categories');
      setCategories(response.data.data);
    } catch (err) {
      setError('No se pudo cargar el catálogo de categorías.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category: ProductCategory | null = null) => {
    setEditingCategory(category);
    if (category) {
      form.setValues({ name: category.name });
    } else {
      form.reset();
    }
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingCategory) {
        await apiClient.patch(`/product-categories/${editingCategory.id}`, values);
      } else {
        await apiClient.post('/product-categories', values);
      }
      await fetchCategories();
      closeModal();
    } catch (err: any) {
      form.setErrors({ name: err.response?.data?.message || 'Error al guardar la categoría.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Los productos asociados no se borrarán, pero quedarán sin categoría.')) {
      try {
        await apiClient.delete(`/product-categories/${id}`);
        setCategories((current) => current.filter((c) => c.id !== id));
      } catch (err) {
        alert('No se pudo eliminar la categoría.');
        console.error('Failed to delete category', err);
      }
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const rows = categories.map((category) => (
    <Table.Tr key={category.id}>
      <Table.Td>{category.name}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button variant="subtle" size="xs" onClick={() => handleOpenModal(category)}>Editar</Button>
          <Button variant="subtle" size="xs" color="red" onClick={() => handleDelete(category.id)}>Eliminar</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Nombre de la Categoría" placeholder="Ej: Químicos Reguladores" {...form.getInputProps('name')} />
            <Button type="submit" mt="md">{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Catálogo de Categorías de Productos</Title>
          <Button onClick={() => handleOpenModal()}>Crear Nueva Categoría</Button>
        </Group>
        <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={2}>No hay categorías definidas en el catálogo.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}