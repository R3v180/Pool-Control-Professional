// filename: packages/client/src/features/technician/pages/WorkOrderPage.tsx
// version: 2.0.2 (REFACTOR: Remove redundant incident management modals)

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
  FileInput,
  Progress,
  ThemeIcon,
  SimpleGrid,
  Image,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../api/apiClient';
import axios from 'axios';

// --- Tipos ---
type IncidentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

interface IncidentImage {
  id: string;
  url: string;
}

interface Notification {
    id: string;
    status: 'PENDING' | 'RESOLVED';
    resolutionNotes: string | null;
    priority: IncidentPriority | null;
    resolutionDeadline: string | null;
    images: IncidentImage[];
}

interface VisitResult { parameterName: string; parameterUnit: string | null; value: string; }
interface Product { id: string; name: string; unit: string; }
interface Consumption { quantity: number; product: Product; }
interface VisitDetails {
  id: string; status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; notes: string | null; hasIncident: boolean;
  completedTasks: string[]; results: VisitResult[]; notifications: Notification[]; consumptions: Consumption[];
  pool: {
    name: string; address: string; client: { name: string };
    configurations: {
      id: string;
      parameterTemplate?: { id: string; name: string; unit: string | null; type: 'NUMBER' | 'BOOLEAN' | 'TEXT' | 'SELECT'; selectOptions: string[]; };
      taskTemplate?: { id: string; name: string; };
    }[];
  };
}
interface ApiResponse<T> { success: boolean; data: T; }

// --- Componente de Solo Lectura (para el Admin) ---
const ReadOnlyWorkOrder = ({ visit }: { visit: VisitDetails }) => {
  const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const incidentNotification = visit.notifications.length > 0 ? visit.notifications[0] : null;

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    openImageModal();
  };

  return (
    <>
      <Modal opened={imageModalOpened} onClose={closeImageModal} title="Imagen de la Incidencia" centered size="xl">
        {selectedImage && <Image src={selectedImage} />}
      </Modal>

      <Container>
          <Breadcrumbs><Link to="/">Dashboard</Link><Text>{visit.pool.name}</Text></Breadcrumbs>
          <Grid align="center" justify="space-between" my="lg"><Grid.Col span="auto"><Title order={2}>Resumen de Visita: {visit.pool.name}</Title></Grid.Col><Grid.Col span="content"><Badge color="green" size="lg">COMPLETADA</Badge></Grid.Col></Grid>
          <Text c="dimmed">{visit.pool.client.name} - {visit.pool.address}</Text>

          <Paper withBorder p="md" mt="xl">
              <Stack>
                  {visit.results.length > 0 && (<div><Title order={4} mb="sm">Resultados de Mediciones</Title>{visit.results.map(r => <Text key={r.parameterName}><strong>{r.parameterName}:</strong> {r.value} {r.parameterUnit || ''}</Text>)}</div>)}
                  {visit.completedTasks.length > 0 && (<div><Title order={4} mt="lg" mb="sm">Tareas Realizadas</Title>{visit.completedTasks.map(t => <Text key={t}>✅ {t}</Text>)}</div>)}
                  {visit.consumptions.length > 0 && (<div><Title order={4} mt="lg" mb="sm">Productos Consumidos</Title>{visit.consumptions.map(c => <Text key={c.product.id}>- {c.quantity} {c.product.unit} de {c.product.name}</Text>)}</div>)}
                  <Divider my="sm" />
                  <div>
                      <Title order={4}>Observaciones e Incidencia</Title>
                      <Text fw={500} mt="sm">Notas del Técnico:</Text>
                      <Paper withBorder p="sm" bg="gray.0" mt="xs"><Text>{visit.notes || 'No se dejaron notas.'}</Text></Paper>
                      
                      {incidentNotification && incidentNotification.images.length > 0 && (
                        <>
                          <Text fw={500} mt="lg">Imágenes Adjuntas:</Text>
                          <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} mt="xs">
                            {incidentNotification.images.map(image => (
                              <Paper key={image.id} withBorder radius="md" style={{ cursor: 'pointer' }} onClick={() => handleImageClick(image.url)}>
                                <Image src={image.url} height={120} radius="md" />
                              </Paper>
                            ))}
                          </SimpleGrid>
                        </>
                      )}

                      {visit.hasIncident && incidentNotification && (
                        <Paper withBorder p="sm" mt="md" shadow="xs" bg={incidentNotification.status === 'RESOLVED' ? 'gray.0' : 'yellow.0'}>
                            {incidentNotification.status === 'RESOLVED' ? (
                                <Stack mt="md" gap="xs">
                                  <Badge color="green" size="lg">INCIDENCIA RESUELTA</Badge>
                                  <Text fw={500} mt="sm">Notas de Resolución (Admin):</Text>
                                  <Paper withBorder p="sm" bg="green.0" mt="xs"><Text>{incidentNotification.resolutionNotes}</Text></Paper>
                                </Stack>
                            ) : (
                                <Group>
                                  <Badge color="red" size="lg" variant="filled">INCIDENCIA PENDIENTE</Badge>
                                  <Button 
                                    component={Link} 
                                    to={`/incidents/${incidentNotification.id}`}
                                    variant="light"
                                  >
                                    Gestionar Incidencia →
                                  </Button>
                                </Group>
                            )}
                        </Paper>
                      )}
                  </div>
              </Stack>
          </Paper>
        </Container>
    </>
  );
};


// --- Componente de Formulario Editable (para el Técnico) ---
// (Este componente no ha sido modificado)
interface UploadedFile { file: File; progress: number; url?: string; error?: string; }
const EditableWorkOrder = ({ visit, products, onSubmit }: { visit: VisitDetails; products: Product[], onSubmit: (values: any) => Promise<void> }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const form = useForm({
    initialValues: {
      results: visit.pool.configurations.filter(c => c.parameterTemplate).reduce((acc, c) => ({ ...acc, [c.id]: '' }), {}),
      completedTasks: visit.pool.configurations.filter(c => c.taskTemplate).reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
      consumptions: [] as { productId: string; quantity: number | '' }[],
      notes: '',
      hasIncident: false,
    },
  });

  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const newFiles = files.map(file => ({ file, progress: 0 }));
    setUploadedFiles(prev => [...prev, ...newFiles]);

    try {
      const { data: signatureData } = await apiClient.get('/uploads/signature');
      const { signature, timestamp, apiKey, cloudName } = signatureData.data;

      for (const fileObj of newFiles) {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);

        try {
          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData,
            { onUploadProgress: (event) => {
                const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
                setUploadedFiles(prev => prev.map(f => f.file === fileObj.file ? { ...f, progress } : f));
            }}
          );
          setUploadedFiles(prev => prev.map(f => f.file === fileObj.file ? { ...f, url: response.data.secure_url } : f));
        } catch (uploadError) {
          setUploadedFiles(prev => prev.map(f => f.file === fileObj.file ? { ...f, error: 'Error al subir' } : f));
        }
      }
    } catch (signatureError) {
      console.error("Error al obtener la firma", signatureError);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    const successfulUrls = uploadedFiles.filter(f => f.url).map(f => f.url!);
    const payload = { ...values, imageUrls: successfulUrls };
    await onSubmit(payload);
    setIsSubmitting(false);
  };
  
  const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (${p.unit})` }));
  const consumptionFields = form.values.consumptions.map((_, index) => <Grid key={index} align="flex-end"><Grid.Col span={7}><Select label={index === 0 ? 'Producto' : ''} placeholder="Seleccione un producto" data={productOptions} {...form.getInputProps(`consumptions.${index}.productId`)} required /></Grid.Col><Grid.Col span={3}><NumberInput label={index === 0 ? 'Cantidad' : ''} placeholder="0.0" min={0} decimalScale={2} {...form.getInputProps(`consumptions.${index}.quantity`)} required /></Grid.Col><Grid.Col span={2}><ActionIcon color="red" onClick={() => form.removeListItem('consumptions', index)}>🗑️</ActionIcon></Grid.Col></Grid>);
  const parametersToMeasure = visit.pool.configurations.filter(c => c.parameterTemplate);
  const tasksToComplete = visit.pool.configurations.filter(c => c.taskTemplate);
  const renderParameterInput = (config: typeof parametersToMeasure[0]) => { const param = config.parameterTemplate; if (!param) return null; const label = `${param.name}${param.unit ? ` (${param.unit})` : ''}`; switch (param.type) { case 'NUMBER': return <NumberInput label={label} {...form.getInputProps(`results.${config.id}`)} />; case 'BOOLEAN': return <Switch mt="md" label={label} {...form.getInputProps(`results.${config.id}`, { type: 'checkbox' })} />; case 'TEXT': return <TextInput label={label} {...form.getInputProps(`results.${config.id}`)} />; case 'SELECT': return <Select label={label} data={param.selectOptions} {...form.getInputProps(`results.${config.id}`)} />; default: return <Text c="red">Tipo no soportado: {param.type}</Text>; } };

  return (
      <Container>
        <Breadcrumbs><Link to="/my-route">Mi Ruta</Link><Text>{visit.pool.name}</Text></Breadcrumbs>
        <Title order={2} my="lg">Parte de Trabajo: {visit.pool.name}</Title>
        <Text c="dimmed">{visit.pool.client.name} - {visit.pool.address}</Text>
        <Paper withBorder p="md" mt="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {parametersToMeasure.length > 0 && (<div><Title order={4} mb="sm">Mediciones</Title><Stack>{parametersToMeasure.map(p => <div key={p.id}>{renderParameterInput(p)}</div>)}</Stack></div>)}
              {tasksToComplete.length > 0 && (<div><Title order={4} mt="lg" mb="sm">Tareas</Title><Stack>{tasksToComplete.map(t => <Checkbox key={t.id} label={t.taskTemplate?.name} {...form.getInputProps(`completedTasks.${t.id}`, { type: 'checkbox' })} />)}</Stack></div>)}
              <Divider my="md" label="Consumo de Productos" labelPosition="center" />
              {consumptionFields}
              <Button mt="xs" variant="outline" onClick={() => form.insertListItem('consumptions', { productId: '', quantity: '' })}>+ Añadir Producto</Button>
              <Divider my="md" />
              <Title order={4} mb="sm">Observaciones e Incidencias</Title>
              <Textarea label="Notas de la visita" placeholder="Cualquier observación relevante..." {...form.getInputProps('notes')} />
              <Checkbox label="Reportar como Incidencia" description="Marcar si hay un problema para el administrador." {...form.getInputProps('hasIncident', { type: 'checkbox' })} />
              
              {form.values.hasIncident && (
                <Stack mt="sm" gap="xs">
                  <FileInput label="Adjuntar Fotos" placeholder="Seleccionar imágenes..." multiple accept="image/png,image/jpeg" onChange={handleImageUpload} />
                  {uploadedFiles.length > 0 && (
                    <Stack gap="xs">
                      {uploadedFiles.map((fileObj, index) => (
                        <Paper key={index} withBorder p="xs" radius="sm">
                          <Group justify="space-between">
                            <Text size="sm" truncate style={{flex: 1}}>{fileObj.file.name}</Text>
                            {fileObj.progress < 100 && !fileObj.error && <Progress value={fileObj.progress} striped animated size="lg" style={{width: '100px'}} />}
                            {fileObj.url && <ThemeIcon color="green" variant="light">✓</ThemeIcon>}
                            {fileObj.error && <ThemeIcon color="red" variant="light">✗</ThemeIcon>}
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}
              
              <Button type="submit" mt="xl" size="lg" loading={isSubmitting}>Guardar y Finalizar Visita</Button>
            </Stack>
          </form>
        </Paper>
      </Container>
  );
};


// --- Componente Principal ---
export function WorkOrderPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<VisitDetails | null>(null); // <-- LÍNEA CORREGIDA
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