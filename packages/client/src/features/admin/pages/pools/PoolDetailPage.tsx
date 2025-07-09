// filename: packages/client/src/features/admin/pages/pools/PoolDetailPage.tsx
// Version: 1.1.1 (Fix JSX syntax errors and remove unused variable)
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../../api/apiClient.js';

// --- Tipos ---
const Frequencies = ['DIARIA', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'] as const;
type Frequency = (typeof Frequencies)[number];

interface Pool { id: string; name: string; clientId: string; }
interface ParameterTemplate { id: string; name: string; unit: string | null; }
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
  const [pool, ] = useState<Pool | null>(null); // setPool no se usa aún
  const [configurations, setConfigurations] = useState<PoolConfiguration[]>([]);
  const [parameterCatalog, setParameterCatalog] = useState<ParameterTemplate[]>([]);
  const [taskCatalog, setTaskCatalog] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
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
    setError(null);
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
    // TODO: Fetch pool details to show name and client in breadcrumbs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId]);

  const handleOpenAddModal = (item: { id: string; name: string; }, type: 'parameter' | 'task') => {
    setItemToAdd({ ...item, type });
    configForm.reset();
    openModal();
  };

  const handleConfigSubmit = async (values: typeof configForm.values) => {
    if (!itemToAdd || !poolId) return;
    const payload: any = {
      poolId,
      frequency: values.frequency,
      ...(itemToAdd.type === 'parameter' && { parameterTemplateId: itemToAdd.id, minThreshold: values.minThreshold, maxThreshold: values.maxThreshold }),
      ...(itemToAdd.type === 'task' && { taskTemplateId: itemToAdd.id }),
    };

    try {
      await apiClient.post('/pool-configurations', payload);
      await fetchData();
      closeModal();
    } catch (err: any) {
      configForm.setErrors({ frequency: err.response?.data?.message || 'Error al añadir la configuración' });
    }
  };
  
  const handleConfigDelete = async (configId: string) => {
    if (window.confirm('¿Estás seguro de que quieres quitar este ítem de la ficha?')) {
      try {
        await apiClient.delete(`/pool-configurations/${configId}`);
        await fetchData();
      } catch (err) {
        // TODO: Mostrar notificación de error
      }
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;

  const breadcrumbs = (
    <Breadcrumbs>
      <Link to="/clients">Clientes</Link>
      <Text>Cliente (TODO)</Text>
      <Text>{pool?.name || 'Piscina'}</Text>
    </Breadcrumbs>
  );

  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title={`Añadir: ${itemToAdd?.name}`} centered>
        <form onSubmit={configForm.onSubmit(handleConfigSubmit)}>
          <Stack>
            <Select label="Frecuencia" required data={[...Frequencies]} {...configForm.getInputProps('frequency')} />
            {itemToAdd?.type === 'parameter' && (
              <>
                <NumberInput label="Umbral Mínimo (opcional)" {...configForm.getInputProps('minThreshold')} />
                <NumberInput label="Umbral Máximo (opcional)" {...configForm.getInputProps('maxThreshold')} />
              </>
            )}
            <Button type="submit" mt="md">Añadir a la Ficha</Button>
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
                        <Button variant="subtle" size="xs" color="red" onClick={() => handleConfigDelete(config.id)}>Quitar</Button>
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
                    <Button size="xs" onClick={() => handleOpenAddModal(param, 'parameter')}>Añadir</Button>
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
                    <Button size="xs" onClick={() => handleOpenAddModal(task, 'task')}>Añadir</Button>
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