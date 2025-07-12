// filename: packages/client/src/features/admin/pages/ProductCatalogPage.tsx
// version: 1.0.0
// description: Página para la gestión completa (CRUD) del catálogo de productos.

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
  NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient';

// --- Tipos de Datos ---
// Define la estructura de un producto, que coincide con el modelo de Prisma
interface Product {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  cost: number;
}

// Define la estructura de la respuesta de nuestra API
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente Principal ---
export function ProductCatalogPage() {
  // --- Estados del Componente ---
  const [products, setProducts] = useState<Product[]>([]); // Almacena la lista de productos
  const [isLoading, setIsLoading] = useState(true); // Controla el estado de carga
  const [error, setError] = useState<string | null>(null); // Almacena cualquier error de la API
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false); // Controla la visibilidad del modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Guarda el producto que se está editando, o null si es una creación

  // --- Formulario (Mantine Form) ---
  // Se encarga de la gestión de estado y validación de los inputs del modal
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      unit: '',
      cost: 0,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'El nombre del producto es demasiado corto.' : null),
      unit: (value) => (value.trim().length === 0 ? 'La unidad de medida es obligatoria.' : null),
      cost: (value) => (value < 0 ? 'El coste no puede ser un valor negativo.' : null),
    },
  });

  // --- Lógica de Datos (API Calls) ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<Product[]>>('/products');
      setProducts(response.data.data);
    } catch (err) {
      setError('No se pudo cargar el catálogo de productos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial de datos cuando el componente se monta
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Manejadores de Eventos ---

  // Se ejecuta al hacer clic en "Añadir Producto" o "Editar"
  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      // Si estamos editando, llenamos el formulario con los datos del producto
      form.setValues({
        name: product.name,
        description: product.description || '',
        unit: product.unit,
        cost: product.cost,
      });
    } else {
      // Si estamos creando, reseteamos el formulario a sus valores iniciales
      form.reset();
      form.setFieldValue('cost', 0);
    }
    openModal();
  };

  // Se ejecuta al enviar el formulario del modal
  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingProduct) {
        // Si estábamos editando, hacemos una petición PATCH
        await apiClient.patch(`/products/${editingProduct.id}`, values);
      } else {
        // Si estábamos creando, hacemos una petición POST
        await apiClient.post('/products', values);
      }
      // Después de la operación, refrescamos la lista y cerramos el modal
      await fetchProducts();
      closeModal();
    } catch (err: any) {
      form.setErrors({ name: err.response?.data?.message || 'Error al guardar el producto.' });
    }
  };

  // Se ejecuta al hacer clic en el botón "Eliminar"
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        await apiClient.delete(`/products/${id}`);
        // Actualización optimista de la UI: eliminamos el producto del estado local
        setProducts((current) => current.filter((p) => p.id !== id));
      } catch (err) {
        alert('No se pudo eliminar el producto. Es probable que ya esté en uso en alguna visita.');
        console.error('Failed to delete product', err);
      }
    }
  };

  // --- Renderizado del Componente ---

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  // Mapeamos los datos de los productos para generar las filas de la tabla
  const rows = products.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td>{product.name}</Table.Td>
      <Table.Td>{product.description || '-'}</Table.Td>
      <Table.Td>{product.unit}</Table.Td>
      <Table.Td>{product.cost.toFixed(2)} €</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button variant="subtle" size="xs" onClick={() => handleOpenModal(product)}>Editar</Button>
          <Button variant="subtle" size="xs" color="red" onClick={() => handleDelete(product.id)}>Eliminar</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Nombre del Producto" placeholder="Ej: Hipoclorito Sódico 25L" {...form.getInputProps('name')} />
            <Textarea label="Descripción (opcional)" placeholder="Detalles adicionales del producto" {...form.getInputProps('description')} />
            <TextInput required label="Unidad de Medida" placeholder="Ej: L, Kg, Saco, Unidad" {...form.getInputProps('unit')} />
            <NumberInput
                required
                label="Coste por Unidad (€)"
                placeholder="15.50"
                decimalScale={2}
                fixedDecimalScale
                step={0.5}
                min={0}
                {...form.getInputProps('cost')}
            />
            <Button type="submit" mt="md">{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        <Group justify="space-between" align="center">
          <Title order={2} my="lg">Catálogo de Productos</Title>
          <Button onClick={() => handleOpenModal()}>Añadir Nuevo Producto</Button>
        </Group>
        <Table striped withTableBorder withColumnBorders mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>Unidad</Table.Th>
              <Table.Th>Coste</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}>No hay productos definidos en el catálogo.</Table.Td></Table.Tr>}</Table.Tbody>
        </Table>
      </Container>
    </>
  );
}