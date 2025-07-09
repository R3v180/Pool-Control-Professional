// filename: packages/client/src/features/admin/pages/pools/PoolDetailPage.tsx
// Version: 1.2.0 (Implement Edit functionality for Pool Configurations)
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Loader,
  Alert,
  Paper,
  Text,
  Table,
  Breadcrumbs,
  Grid,
  Card,
  Button,
  Group,
  Modal,
  Select,
  NumberInput,
  Stack,
  Menu,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../../api/apiClient.js';

// --- Tipos ---
const Frequencies = ['DIARIA', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'] as const;
type Frequency = (typeof Frequencies)[number];

interface Pool { id: string; name: string; clientId: string; }
interface ParameterTemplate { id: string; name: string; unit: string | null; type: 'NUMBER' | 'BOOLEAN' | 'TEXT' | 'SELECT'; }
interface TaskTemplate { id: string; name: string; }
interface PoolConfiguration {
  id: string;
  frequency: Frequency;
  minThreshold: number | null;
  maxThreshold: number | null;
  parameterTemplate?: ParameterTemplate;
  taskTemplate?: TaskTemplate;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente ---
export function PoolDetailPage() {
  const { id: poolId } = useParams<{ id: string }>();
  const [pool, ] = useState<Pool | null>(null);
  const [configurations, setConfigurations] = useState<PoolConfiguration[]>([]);
  const [parameterCatalog, setParameterCatalog] = useState<ParameterTemplate[]>([]);
  const [taskCatalog, setTaskCatalog] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  // Estado para saber qué estamos configurando (un nuevo ítem o editando uno existente)
  const [editingConfig, setEditingConfig] = useState<PoolConfiguration | null>(null);
  const [itemToAdd, setItemToAdd] = useState<{ id: string; name: string; type: 'parameter' | 'task' } | null>(null);

  const configForm = useForm({
    initialValues: {
      frequency: 'SEMANAL' as Frequency,
      minThreshold: null as number | null,
      maxThreshold: null as number | null,
    },
    validate: {
      frequency: (value) => (Frequencies.includes(value) ? null : 'Frecuencia inválida'),
    },
  });

  const fetchData = async () => {
    if (!poolId) return;
    setIsLoading(true);
    try {
      const [configsRes, paramsRes, tasksRes] = await Promise.all([
        apiClient.get<ApiResponse<PoolConfiguration[]>>(`/pool-configurations/by-pool/${poolId}`),
        apiClient.get<ApiResponse<ParameterTemplate[]>>('/parameters'),
        apiClient.get<ApiResponse<TaskTemplate[]>>('/tasks'),
      ]);
      setConfigurations(configsRes.data.data);
      setParameterCatalog(paramsRes.data.data);
      setTaskCatalog(tasksRes.data.data);
    } catch (err) {
      setError('No se pudo cargar la configuración de la piscina.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId]);

  const handleOpenModal = (config: PoolConfiguration | null, item: { id: string; name: string; } | null, type: 'parameter' | 'task' | null) => {
    setEditingConfig(config);
    setItemToAdd(item ? { ...item, type: type as 'parameter' | 'task' } : null);
    
    if (config) { // Estamos editando
      configForm.setValues({
        frequency: config.frequency,
        minThreshold: config.minThreshold,
        maxThreshold: config.maxThreshold,
      });
    } else { // Estamos creando
      configForm.reset();
    }
    openModal();
  };

  const handleConfigSubmit = async (values: typeof configForm.values) => {
    if (!poolId) return;
    try {
      if (editingConfig) { // Lógica para actualizar
        const payload = { frequency: values.frequency, minThreshold: values.minThreshold, maxThreshold: values.maxThreshold };
        await apiClient.patch(`/pool-configurations/${editingConfig.id}`, payload);
      } else if (itemToAdd) { // Lógica para crear
        const payload = {
          poolId,
          frequency: values.frequency,
          ...(itemToAdd.type === 'parameter' && { parameterTemplateId: itemToAdd.id, minThreshold: values.minThreshold, maxThreshold: values.maxThreshold }),
          ...(itemToAdd.type === 'task' && { taskTemplateId: itemToAdd.id }),
        };
        await apiClient.post('/pool-configurations', payload);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      configForm.setErrors({ frequency: err.response?.data?.message || 'Error al guardar la configuración' });
    }
  };
  
  const handleConfigDelete = async (configId: string) => {
    if (window.confirm('¿Estás seguro de que quieres quitar este ítem de la ficha?')) {
      try {
        await apiClient.delete(`/pool-configurations/${configId}`);
        await fetchData();
      } catch (err) {}
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const currentItem = editingConfig?.parameterTemplate || editingConfig?.taskTemplate || itemToAdd;
  const modalTitle = editingConfig ? `Editar: ${currentItem?.name}` : `Añadir: ${currentItem?.name}`;
  const isParameter = (editingConfig && editingConfig.parameterTemplate) || (itemToAdd?.type === 'parameter');
  
  const breadcrumbs = (
    <Breadcrumbs>
      <Link to="/clients">Clientes</Link>
      <Text>Cliente (TODO)</Text>
      <Text>{pool?.name || 'Piscina'}</Text>
    </Breadcrumbs>
  );

  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title={modalTitle} centered>
        <form onSubmit={configForm.onSubmit(handleConfigSubmit)}>
          <Stack>
            <Select label="Frecuencia" required data={[...Frequencies]} {...configForm.getInputProps('frequency')} />
            {isParameter && (
              <>
                <NumberInput label="Umbral Mínimo (opcional)" {...configForm.getInputProps('minThreshold')} />
                <NumberInput label="Umbral Máximo (opcional)" {...configForm.getInputProps('maxThreshold')} />
              </>
            )}
            <Button type="submit" mt="md">{editingConfig ? 'Guardar Cambios' : 'Añadir a la Ficha'}</Button>
          </Stack>
        </form>
      </Modal>

      <Container fluid>
        {breadcrumbs}
        <Title order={2} my="lg">Constructor de Ficha: {pool?.name || ''}</Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Ficha de Mantenimiento Actual</Title>
              <Table>
                <Table.Thead><Table.Tr><Table.Th>Ítem</Table.Th><Table.Th>Frecuencia</Table.Th><Table.Th>Acciones</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>
                  {configurations.length > 0 ? configurations.map(config => (
                    <Table.Tr key={config.id}>
                      <Table.Td>{config.parameterTemplate?.name || config.taskTemplate?.name}</Table.Td>
                      <Table.Td>{config.frequency}</Table.Td>
                      <Table.Td>
                        <Menu shadow="md" width={200}>
                          <Menu.Target><Button variant="outline" size="xs">Acciones</Button></Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item onClick={() => handleOpenModal(config, null, null)}>Editar</Menu.Item>
                            <Menu.Item color="red" onClick={() => handleConfigDelete(config.id)}>Quitar</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  )) : <Table.Tr><Table.Td colSpan={3}>La ficha está vacía. Añade ítems desde los catálogos.</Table.Td></Table.Tr>}
                </Table.Tbody>
              </Table>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" mb="md">
              <Title order={4} mb="md">Catálogo de Parámetros Disponibles</Title>
              {parameterCatalog.map(param => (
                <Card key={param.id} shadow="sm" p="sm" mb="xs" withBorder>
                  <Group justify="space-between">
                    <Text>{param.name} {param.unit ? `(${param.unit})` : ''}</Text>
                    <Button size="xs" onClick={() => handleOpenModal(null, param, 'parameter')}>Añadir</Button>
                  </Group>
                </Card>
              ))}
            </Paper>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Catálogo de Tareas Disponibles</Title>
              {taskCatalog.map(task => (
                <Card key={task.id} shadow="sm" p="sm" mb="xs" withBorder>
                  <Group justify="space-between">
                    <Text>{task.name}</Text>
                    <Button size="xs" onClick={() => handleOpenModal(null, task, 'task')}>Añadir</Button>
                  </Group>
                </Card>
              ))}
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}