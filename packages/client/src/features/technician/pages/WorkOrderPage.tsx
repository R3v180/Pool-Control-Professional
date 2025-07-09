// filename: packages/client/src/features/technician/pages/WorkOrderPage.tsx
// Version: 1.2.2 (Remove window.location.reload and rely on router state)
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import apiClient from '../../../api/apiClient';

// --- Tipos ---
interface ParameterConfig {
  id: string;
  name: string;
  unit: string | null;
  type: 'NUMBER' | 'BOOLEAN' | 'TEXT' | 'SELECT';
  selectOptions: string[];
}
interface TaskConfig {
  id: string;
  name: string;
}
interface VisitDetails {
  id: string;
  pool: {
    configurations: {
      id: string;
      parameterTemplate?: ParameterConfig;
      taskTemplate?: TaskConfig;
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

// --- Componente ---
export function WorkOrderPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<VisitDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      results: {} as Record<string, string | number | boolean>,
      completedTasks: {} as Record<string, boolean>,
      notes: '',
      hasIncident: false,
    },
  });

  useEffect(() => {
    if (!visitId) {
      setError('No se ha proporcionado un ID de visita.');
      setIsLoading(false);
      return;
    }
    const fetchVisitDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ApiResponse<VisitDetails>>(`/visits/${visitId}`);
        const visitData = response.data.data;
        setVisit(visitData);
        
        form.setInitialValues({
          results: visitData.pool.configurations
            .filter(c => c.parameterTemplate)
            .reduce((acc, c) => ({ ...acc, [c.id]: '' }), {}),
          completedTasks: visitData.pool.configurations
            .filter(c => c.taskTemplate)
            .reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
          notes: '',
          hasIncident: false,
        });
        form.reset();
      } catch (err) {
        setError('No se pudo cargar la información de la visita.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisitDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!visitId) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/visits/${visitId}/complete`, values);
      // Simplemente navegamos de vuelta.
      navigate('/my-route');
    } catch (err) {
      console.error('Error submitting work order', err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Container style={{ textAlign: 'center', paddingTop: '50px' }}><Loader size="xl" /></Container>;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!visit) return <Alert color="yellow" title="Aviso">Visita no encontrada.</Alert>;
  
  const breadcrumbs = (
    <Breadcrumbs>
      <Link to="/my-route">Mi Ruta</Link>
      <Text>{visit.pool.name}</Text>
    </Breadcrumbs>
  );

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
      {breadcrumbs}
      <Title order={2} my="lg">Parte de Trabajo: {visit.pool.name}</Title>
      <Text c="dimmed">{visit.pool.client.name} - {visit.pool.address}</Text>

      <Paper withBorder p="md" mt="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {parametersToMeasure.length > 0 && (
              <div>
                <Title order={4} mb="sm">Mediciones de Parámetros</Title>
                <Stack>{parametersToMeasure.map(p => <div key={p.id}>{renderParameterInput(p)}</div>)}</Stack>
              </div>
            )}
            {tasksToComplete.length > 0 && (
              <div>
                <Title order={4} mt="lg" mb="sm">Tareas a Realizar</Title>
                <Stack>{tasksToComplete.map(t => <Checkbox key={t.id} label={t.taskTemplate?.name} {...form.getInputProps(`completedTasks.${t.id}`, { type: 'checkbox' })} />)}</Stack>
              </div>
            )}
            
            <Title order={4} mt="lg" mb="sm">Observaciones e Incidencias</Title>
            <Textarea label="Notas de la visita (opcional)" placeholder="Cualquier observación relevante..." {...form.getInputProps('notes')} />
            <Checkbox label="Reportar como Incidencia" description="Marca esta casilla si hay un problema que requiera la atención del administrador." {...form.getInputProps('hasIncident', { type: 'checkbox' })} />
            
            <Button type="submit" mt="xl" size="lg" loading={isSubmitting}>
              Guardar y Finalizar Visita
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}