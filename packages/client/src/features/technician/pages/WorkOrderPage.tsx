// filename: packages/client/src/features/technician/pages/WorkOrderPage.tsx
// version: 1.7.0 (Implement full product consumption lifecycle)
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Loader,
  Alert,
  Paper,
  Text,
  Breadcrumbs,
  Button,
  Stack,
  Checkbox,
  NumberInput,
  Switch,
  TextInput,
  Select,
  Textarea,
  Badge,
  Grid,
  Modal,
  Group,
  Divider,
  ActionIcon,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import 'dayjs/locale/es';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient';

// --- Tipos ---
type IncidentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

interface VisitResult {
  parameterName: string;
  parameterUnit: string | null;
  value: string;
}

interface Notification {
    id: string;
    status: 'PENDING' | 'RESOLVED';
    resolutionNotes: string | null;
    priority: IncidentPriority | null;
    resolutionDeadline: string | null;
}

interface Product {
    id: string;
    name: string;
    unit: string;
}

interface Consumption {
    quantity: number;
    product: Product;
}

interface VisitDetails {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  hasIncident: boolean;
  completedTasks: string[];
  results: VisitResult[];
  notifications: Notification[];
  consumptions: Consumption[]; // Campo para los consumos
  pool: {
    configurations: {
      id: string;
      parameterTemplate?: { id: string; name: string; unit: string | null; type: 'NUMBER' | 'BOOLEAN' | 'TEXT' | 'SELECT'; selectOptions: string[]; };
      taskTemplate?: { id: string; name: string; };
    }[];
    name: string;
    address: string;
    client: { name: string };
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// --- Componente de Solo Lectura ---
const ReadOnlyWorkOrder = ({ visit }: { visit: VisitDetails }) => {
  const navigate = useNavigate();
  const [resolutionModalOpened, { open: openResolutionModal, close: closeResolutionModal }] = useDisclosure(false);
  const [classifyModalOpened, { open: openClassifyModal, close: closeClassifyModal }] = useDisclosure(false);
  
  const incidentNotification = visit.notifications.length > 0 ? visit.notifications[0] : null;

  const resolutionForm = useForm({
    initialValues: { resolutionNotes: '' },
    validate: { resolutionNotes: (value) => value.trim().length < 10 ? 'Las notas de resolución son demasiado cortas.' : null },
  });

  const classificationForm = useForm({
      initialValues: {
          priority: incidentNotification?.priority || 'NORMAL',
          deadline: incidentNotification?.resolutionDeadline ? new Date(incidentNotification.resolutionDeadline) : null,
      },
      validate: { priority: (value) => !value ? 'Debe seleccionar una prioridad.' : null }
  });

  const handleResolveIncident = async (values: { resolutionNotes: string }) => {
    if (!incidentNotification) return;
    try {
      await apiClient.post(`/notifications/${incidentNotification.id}/resolve`, values);
      closeResolutionModal();
      navigate('/incidents-history');
    } catch (error) { console.error('Failed to resolve incident', error); }
  };

  const handleClassifyIncident = async (values: { priority: IncidentPriority, deadline: Date | null }) => {
      if (!incidentNotification) return;
      try {
          const deadlineDate = values.deadline ? new Date(values.deadline) : null;
          await apiClient.patch(`/notifications/${incidentNotification.id}/classify`, {
              priority: values.priority,
              deadline: deadlineDate ? deadlineDate.toISOString() : null
          });
          closeClassifyModal();
          navigate('/incidents-history'); 
      } catch (error) { console.error('Failed to classify incident', error); }
  };

  return (
    <>
      <Modal opened={resolutionModalOpened} onClose={closeResolutionModal} title="Gestionar Incidencia" centered>
        <form onSubmit={resolutionForm.onSubmit(handleResolveIncident)}>
          <Stack>
            <Text c="dimmed">Notas del Técnico:</Text>
            <Paper withBorder p="sm" bg="gray.0">{visit.notes || 'N/A'}</Paper>
            <Textarea label="Notas de Resolución (Admin)" placeholder="Ej: Cliente contactado..." required minRows={3} {...resolutionForm.getInputProps('resolutionNotes')}/>
            <Button type="submit" mt="md" color="green">Marcar como Resuelta</Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={classifyModalOpened} onClose={closeClassifyModal} title="Clasificar Incidencia" centered>
          <form onSubmit={classificationForm.onSubmit(handleClassifyIncident)}>
              <Stack>
                  <Select
                    label="Establecer Prioridad"
                    data={['LOW', 'NORMAL', 'HIGH', 'CRITICAL']}
                    required
                    {...classificationForm.getInputProps('priority')}
                  />
                  <DateTimePicker
                    label="Establecer Plazo de Resolución (opcional)"
                    placeholder="Seleccione fecha y hora"
                    locale="es"
                    clearable
                    {...classificationForm.getInputProps('deadline')}
                  />
                  <Button type="submit" mt="md">Guardar Clasificación</Button>
              </Stack>
          </form>
      </Modal>

      <Container>
          <Breadcrumbs><Link to="/">Dashboard</Link><Text>{visit.pool.name}</Text></Breadcrumbs>
          <Grid align="center" justify="space-between" my="lg"><Grid.Col span="auto"><Title order={2}>Resumen de Visita: {visit.pool.name}</Title></Grid.Col><Grid.Col span="content"><Badge color="green" size="lg">COMPLETADA</Badge></Grid.Col></Grid>
          <Text c="dimmed">{visit.pool.client.name} - {visit.pool.address}</Text>

          <Paper withBorder p="md" mt="xl">
              <Stack>
                  {visit.results.length > 0 && (<div><Title order={4} mb="sm">Resultados de Mediciones</Title>{visit.results.map(r => <Text key={r.parameterName}><strong>{r.parameterName}:</strong> {r.value} {r.parameterUnit || ''}</Text>)}</div>)}
                  {visit.completedTasks.length > 0 && (<div><Title order={4} mt="lg" mb="sm">Tareas Realizadas</Title>{visit.completedTasks.map(t => <Text key={t}>✅ {t}</Text>)}</div>)}
                  
                  {visit.consumptions.length > 0 && (
                    <div>
                        <Title order={4} mt="lg" mb="sm">Productos Consumidos</Title>
                        {visit.consumptions.map(c => <Text key={c.product.id}>- {c.quantity} {c.product.unit} de {c.product.name}</Text>)}
                    </div>
                  )}

                  <Divider my="sm" />
                  <div>
                      <Title order={4}>Observaciones e Incidencia</Title>
                      <Text fw={500} mt="sm">Notas del Técnico:</Text>
                      <Paper withBorder p="sm" bg="gray.0" mt="xs"><Text>{visit.notes || 'No se dejaron notas.'}</Text></Paper>
                      
                      {visit.hasIncident && incidentNotification && (
                        <>
                            {incidentNotification.status === 'RESOLVED' ? (
                                <Stack mt="md" gap="xs">
                                    <Badge color="green" size="lg">INCIDENCIA RESUELTA</Badge>
                                    <Text fw={500} mt="sm">Notas de Resolución (Admin):</Text>
                                    <Paper withBorder p="sm" bg="green.0" mt="xs"><Text>{incidentNotification.resolutionNotes}</Text></Paper>
                                </Stack>
                            ) : (
                                <Group mt="md">
                                    <Badge color="red" size="lg">INCIDENCIA PENDIENTE</Badge>
                                    <Button onClick={openClassifyModal} variant="outline">Clasificar</Button>
                                    <Button onClick={openResolutionModal} color="green">Resolver</Button>
                                </Group>
                            )}
                        </>
                      )}
                  </div>
              </Stack>
          </Paper>
        </Container>
    </>
  );
};


// --- Componente de Formulario Editable ---
const EditableWorkOrder = ({ visit, products, onSubmit }: { visit: VisitDetails; products: Product[], onSubmit: (values: any) => Promise<void> }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    initialValues: {
      results: visit.pool.configurations.filter(c => c.parameterTemplate).reduce((acc, c) => ({ ...acc, [c.id]: '' }), {}),
      completedTasks: visit.pool.configurations.filter(c => c.taskTemplate).reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
      consumptions: [] as { productId: string; quantity: number | '' }[],
      notes: '',
      hasIncident: false,
    },
  });

  const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (${p.unit})` }));

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  };
  
  const consumptionFields = form.values.consumptions.map((_, index) => (
    <Grid key={index} align="flex-end">
      <Grid.Col span={7}>
        <Select
          label={index === 0 ? 'Producto Consumido' : ''}
          placeholder="Seleccione un producto"
          data={productOptions}
          {...form.getInputProps(`consumptions.${index}.productId`)}
          required
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <NumberInput
          label={index === 0 ? 'Cantidad' : ''}
          placeholder="0.0"
          min={0}
          decimalScale={2}
          {...form.getInputProps(`consumptions.${index}.quantity`)}
          required
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <ActionIcon color="red" onClick={() => form.removeListItem('consumptions', index)}>
          🗑️
        </ActionIcon>
      </Grid.Col>
    </Grid>
  ));
  
  const parametersToMeasure = visit.pool.configurations.filter(c => c.parameterTemplate);
  const tasksToComplete = visit.pool.configurations.filter(c => c.taskTemplate);

  const renderParameterInput = (config: typeof parametersToMeasure[0]) => {
    const { parameterTemplate: param } = config;
    if (!param) return null;
    const label = `${param.name}${param.unit ? ` (${param.unit})` : ''}`;

    switch (param.type) {
      case 'NUMBER': return <NumberInput label={label} {...form.getInputProps(`results.${config.id}`)} />;
      case 'BOOLEAN': return <Switch mt="md" label={label} {...form.getInputProps(`results.${config.id}`, { type: 'checkbox' })} />;
      case 'TEXT': return <TextInput label={label} {...form.getInputProps(`results.${config.id}`)} />;
      case 'SELECT': return <Select label={label} data={param.selectOptions} {...form.getInputProps(`results.${config.id}`)} />;
      default: return <Text c="red">Tipo de parámetro no soportado: {param.type}</Text>;
    }
  };
  
  return (
      <Container>
        <Breadcrumbs><Link to="/my-route">Mi Ruta</Link><Text>{visit.pool.name}</Text></Breadcrumbs>
        <Title order={2} my="lg">Parte de Trabajo: {visit.pool.name}</Title>
        <Text c="dimmed">{visit.pool.client.name} - {visit.pool.address}</Text>
        <Paper withBorder p="md" mt="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {parametersToMeasure.length > 0 && (<div><Title order={4} mb="sm">Mediciones de Parámetros</Title><Stack>{parametersToMeasure.map(p => <div key={p.id}>{renderParameterInput(p)}</div>)}</Stack></div>)}
              {tasksToComplete.length > 0 && (<div><Title order={4} mt="lg" mb="sm">Tareas a Realizar</Title><Stack>{tasksToComplete.map(t => <Checkbox key={t.id} label={t.taskTemplate?.name} {...form.getInputProps(`completedTasks.${t.id}`, { type: 'checkbox' })} />)}</Stack></div>)}
              
              <Divider my="md" label="Consumo de Productos" labelPosition="center" />
              {consumptionFields}
              <Button 
                mt="xs" 
                variant="outline" 
                onClick={() => form.insertListItem('consumptions', { productId: '', quantity: '' })}
              >
                + Añadir Producto
              </Button>

              <Divider my="md" />
              <Title order={4} mb="sm">Observaciones e Incidencias</Title>
              <Textarea label="Notas de la visita (opcional)" placeholder="Cualquier observación relevante..." {...form.getInputProps('notes')} />
              <Checkbox label="Reportar como Incidencia" description="Marca esta casilla si hay un problema que requiera la atención del administrador." {...form.getInputProps('hasIncident', { type: 'checkbox' })} />
              
              <Button type="submit" mt="xl" size="lg" loading={isSubmitting}>Guardar y Finalizar Visita</Button>
            </Stack>
          </form>
        </Paper>
      </Container>
  );
};


// --- Componente Principal "WorkOrderPage" ---
export function WorkOrderPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<VisitDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visitId) { setError('No se ha proporcionado un ID de visita.'); setIsLoading(false); return; }
    
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [visitResponse, productsResponse] = await Promise.all([
          apiClient.get<ApiResponse<VisitDetails>>(`/visits/${visitId}`),
          apiClient.get<ApiResponse<Product[]>>('/products')
        ]);
        setVisit(visitResponse.data.data);
        setProducts(productsResponse.data.data);
      } catch (err) { setError('No se pudo cargar la información de la visita o los productos.'); } finally { setIsLoading(false); }
    };
    fetchAllData();
  }, [visitId]);

  const handleSubmit = async (values: any) => {
    if (!visitId) return;
    try {
      await apiClient.post(`/visits/${visitId}/complete`, values);
      navigate('/my-route');
    } catch (err) { console.error('Error submitting work order', err); }
  };

  if (isLoading) return <Container style={{ textAlign: 'center', paddingTop: '50px' }}><Loader size="xl" /></Container>;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!visit) return <Alert color="yellow" title="Aviso">Visita no encontrada.</Alert>;
  
  if (visit.status === 'COMPLETED') {
    return <ReadOnlyWorkOrder visit={visit} />;
  }
  
  return <EditableWorkOrder visit={visit} products={products} onSubmit={handleSubmit} />;
}