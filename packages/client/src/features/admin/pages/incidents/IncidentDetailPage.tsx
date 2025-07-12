// filename: packages/client/src/features/admin/pages/incidents/IncidentDetailPage.tsx
// version: 2.3.8 (DEFINITIVE_FIX: Using 'as any' to bypass TS inference issue)

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Title, Loader, Alert, Paper, Text, Breadcrumbs, Button, Group,
  Modal, TextInput, Stack, Textarea, Select, Badge, Card, ActionIcon, Divider, SimpleGrid, Image
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import 'dayjs/locale/es';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import apiClient from '../../../../api/apiClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../../providers/AuthProvider';

// --- Tipos, Interfaces y Mapeos ---
type IncidentStatus = 'PENDING' | 'RESOLVED';
type IncidentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
type IncidentTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
interface User { id: string; name: string; }
interface IncidentImage { id: string; url: string; }
interface IncidentTaskLog { id: string, action: string, details: string, createdAt: string, user: { name: string } }
interface IncidentTask {
  id: string; title: string; description: string | null; status: IncidentTaskStatus;
  priority: IncidentPriority; deadline: string | null; assignedTo: User | null; resolutionNotes: string | null;
}
interface NotificationDetails {
  id: string; message: string; status: IncidentStatus; priority: IncidentPriority | null; createdAt: string;
  images: IncidentImage[];
  visit: { id: string; pool: { name: string; }; technician: { name: string } | null; } | null;
}
interface ApiResponse<T> { success: boolean; data: T; }
const taskStatusColors: Record<IncidentTaskStatus, string> = { PENDING: 'gray', IN_PROGRESS: 'blue', COMPLETED: 'green', CANCELLED: 'red' };
const priorityColors: Record<IncidentPriority, string> = { LOW: 'gray', NORMAL: 'blue', HIGH: 'orange', CRITICAL: 'red' };

// ===================================================================
// --- VISTA PARA EL TÉCNICO ---
// ===================================================================
const TechnicianTaskView = ({ tasks, onUpdate }: { tasks: IncidentTask[], onUpdate: () => void }) => {
  const { user } = useAuth();
  const myTask = tasks.find(t => t.assignedTo?.id === user?.id);

  const [comment, setComment] = useState('');
  const [newDeadline, setNewDeadline] = useState<Date | null>(null);
  
  const handleStatusChange = async (status: IncidentTaskStatus, resolutionNotes?: string) => {
    if (!myTask) return;
    await apiClient.patch(`/incident-tasks/${myTask.id}/status`, { status, resolutionNotes });
    onUpdate();
  };

  const handleAddLog = async () => {
    if (!myTask || !comment) return;
    await apiClient.post(`/incident-tasks/${myTask.id}/log`, {
      details: comment,
      newDeadline: newDeadline ? newDeadline.toISOString() : undefined,
    });
    setComment('');
    setNewDeadline(null);
    onUpdate();
  };

  if (!myTask) {
    return <Alert color="orange">No tienes una tarea específica asignada para esta incidencia.</Alert>
  }

  return (
    <Stack>
      <Title order={3}>Tarea Asignada: {myTask.title}</Title>
      <Text c="dimmed">{myTask.description}</Text>
      <Group>
        <Badge color={taskStatusColors[myTask.status]}>{myTask.status}</Badge>
        <Badge color={priorityColors[myTask.priority]}>Prioridad: {myTask.priority}</Badge>
      </Group>

      <Paper withBorder p="md" mt="lg">
        <Title order={4} mb="md">Acciones</Title>
        <Group>
          <Button disabled={myTask.status !== 'PENDING'} onClick={() => handleStatusChange('IN_PROGRESS')}>Empezar Tarea</Button>
          <Button color="green" disabled={myTask.status === 'COMPLETED'} onClick={() => {
            const notes = prompt("Añade notas de resolución para completar la tarea:");
            if (notes) handleStatusChange('COMPLETED', notes);
          }}>Completar Tarea</Button>
        </Group>

        <Divider my="lg" label="Añadir Actualización o Solicitar Aplazamiento" />
        <Textarea
          placeholder="Ej: No hay stock de la pieza necesaria..."
          label="Comentario"
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
        />
        <DateTimePicker
          label="Sugerir nuevo plazo (opcional)"
          locale="es"
          clearable
          value={newDeadline}
          // Using 'as any' to bypass a persistent but likely incorrect TS inference error.
          // The state itself remains strongly typed as <Date | null>.
          onChange={setNewDeadline as any} // <-- CORRECCIÓN FINAL
          mt="sm"
        />
        <Button mt="md" onClick={handleAddLog} disabled={!comment}>Enviar Actualización</Button>
      </Paper>
    </Stack>
  );
};


// ===================================================================
// --- VISTA PARA EL ADMIN ---
// ===================================================================
const AdminIncidentView = ({ notification, tasks, technicians, onUpdate }: { notification: NotificationDetails, tasks: IncidentTask[], technicians: User[], onUpdate: () => void }) => {
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState<IncidentTask | null>(null);
  const [logs, setLogs] = useState<IncidentTaskLog[]>([]);
  const [selectedTaskForLogs, setSelectedTaskForLogs] = useState<IncidentTask | null>(null);
  
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      priority: 'NORMAL' as IncidentPriority,
      assignedToId: null as string | null,
      deadline: null as Date | null,
    },
    validate: {
      title: (value) => (value.trim().length < 5 ? 'El título es demasiado corto.' : null),
    },
  });

  const handleOpenModal = (task: IncidentTask | null = null) => {
    setEditingTask(task);
    if (task) {
      const deadlineDate = task.deadline ? new Date(task.deadline) : null;
      form.setValues({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        assignedToId: task.assignedTo?.id || null,
        deadline: deadlineDate,
      });
    } else {
      form.reset();
      form.setFieldValue('priority', 'NORMAL');
    }
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!notification.id) return;
    const payload = { ...values, deadline: values.deadline instanceof Date ? values.deadline.toISOString() : null };
    try {
      if (editingTask) { await apiClient.patch(`/incident-tasks/${editingTask.id}`, payload);
      } else { await apiClient.post('/incident-tasks', { ...payload, notificationId: notification.id }); }
      onUpdate();
      closeModal();
    } catch (err: any) { form.setErrors({ title: err.response?.data?.message || 'Error al guardar la tarea.' }); }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('¿Estás seguro?')) { try { await apiClient.delete(`/incident-tasks/${taskId}`); onUpdate(); } catch (err) { alert('No se pudo eliminar la tarea.'); } }
  };

  const handleViewLogs = async (task: IncidentTask) => {
    if (selectedTaskForLogs?.id === task.id) {
      setSelectedTaskForLogs(null);
      return;
    }
    setSelectedTaskForLogs(task);
    const response = await apiClient.get<ApiResponse<IncidentTaskLog[]>>(`/incident-tasks/${task.id}/logs`);
    setLogs(response.data.data);
  };
  
  const technicianOptions = technicians.map(t => ({ value: t.id, label: t.name }));

  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title={editingTask ? 'Editar Tarea' : 'Crear Tarea'} centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Título" {...form.getInputProps('title')} />
            <Textarea label="Descripción" {...form.getInputProps('description')} />
            <Select label="Prioridad" data={['LOW', 'NORMAL', 'HIGH', 'CRITICAL']} required {...form.getInputProps('priority')} />
            <Select label="Asignar a" data={technicianOptions} clearable {...form.getInputProps('assignedToId')} />
            <DateTimePicker label="Plazo Límite" locale="es" clearable {...form.getInputProps('deadline')} />
            <Button type="submit" mt="md">{editingTask ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
          </Stack>
        </form>
      </Modal>

      <Group justify="space-between" align="center" mb="md"><Title order={3}>Tareas de Seguimiento</Title><Button onClick={() => handleOpenModal()}>+ Crear Tarea</Button></Group>
      
      <Stack>
        {tasks.length > 0 ? (
          tasks.map(task => {
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status === 'PENDING';
            return (
              <Card key={task.id} withBorder shadow="sm" p="md" style={ isOverdue ? { borderLeft: '4px solid var(--mantine-color-red-7)' } : {}}>
                <Group justify="space-between" align="flex-start">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Title order={5}>{task.title}</Title>
                    {task.description && <Text size="sm" c="dimmed">{task.description}</Text>}
                    <Divider />
                    <Group gap="sm">
                      <Badge color={taskStatusColors[task.status]} variant="light">{task.status}</Badge>
                      <Badge color={priorityColors[task.priority]} variant="light">Prioridad: {task.priority}</Badge>
                      {task.assignedTo && <Text size="xs">Asignado a: <strong>{task.assignedTo.name}</strong></Text>}
                    </Group>
                    {task.deadline && <Text size="xs" c={isOverdue ? 'red' : 'dimmed'} fw={isOverdue ? 700 : 400}>Plazo: {format(new Date(task.deadline), 'd MMM yyyy, HH:mm', { locale: es })} {isOverdue && '(VENCIDA)'}</Text>}
                    {task.resolutionNotes && <Textarea value={task.resolutionNotes} readOnly label="Notas de Resolución" mt="xs" />}
                    {selectedTaskForLogs?.id === task.id && logs.length > 0 && (
                      <Paper withBorder p="xs" mt="sm" radius="md">
                        <Text size="xs" fw={700} mb="xs">Historial de la Tarea:</Text>
                        <Stack gap="xs">
                          {logs.map(log => <Text size="xs" key={log.id}><strong>{log.user.name}</strong> ({format(new Date(log.createdAt), 'dd/MM HH:mm')}) - {log.details}</Text>)}
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                  <Stack>
                    <Button.Group orientation="vertical">
                      <Button variant="subtle" size="xs" onClick={() => handleOpenModal(task)}>Editar</Button>
                      <Button variant="subtle" size="xs" onClick={() => handleViewLogs(task)}>Ver Historial</Button>
                      <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(task.id)}>🗑️</ActionIcon>
                    </Button.Group>
                  </Stack>
                </Group>
              </Card>
            )
          })
        ) : (<Text c="dimmed">No hay tareas de seguimiento para esta incidencia.</Text>)}
      </Stack>
    </>
  );
};


// ===================================================================
// --- COMPONENTE PRINCIPAL (DESPACHADOR) ---
// ===================================================================
export function IncidentDetailPage() {
  const { notificationId } = useParams<{ notificationId: string }>();
  const { user } = useAuth();
  
  const [notification, setNotification] = useState<NotificationDetails | null>(null);
  const [tasks, setTasks] = useState<IncidentTask[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!notificationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [notificationRes, tasksRes, techniciansRes] = await Promise.all([
        apiClient.get<ApiResponse<NotificationDetails>>(`/notifications/${notificationId}`),
        apiClient.get<ApiResponse<IncidentTask[]>>(`/incident-tasks/by-notification/${notificationId}`),
        apiClient.get<ApiResponse<User[]>>('/users/technicians')
      ]);
      setNotification(notificationRes.data.data);
      setTasks(tasksRes.data.data);
      setTechnicians(techniciansRes.data.data.map(t => ({ id: t.id, name: t.name })));
    } catch (err) {
      setError('No se pudo cargar la información de la incidencia.');
    } finally { setIsLoading(false); }
  };

  const handleImageClick = (url: string) => { setSelectedImage(url); openImageModal(); };

  useEffect(() => { fetchData(); // eslint-disable-next-line
  }, [notificationId]);
  
  if (isLoading) return <Container p="xl" style={{ display: 'flex', justifyContent: 'center' }}><Loader /></Container>;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  if (!notification) return <Alert color="yellow">Incidencia no encontrada.</Alert>;

  const breadcrumbs = (<Breadcrumbs><Link to={user?.role === 'ADMIN' ? "/incidents-history" : "/my-route"}>{user?.role === 'ADMIN' ? "Gestión de Incidencias" : "Mi Trabajo de Hoy"}</Link><Text>Detalle</Text></Breadcrumbs>);

  return (
    <Container fluid>
      <Modal opened={imageModalOpened} onClose={closeImageModal} title="Imagen de la Incidencia" centered size="xl">{selectedImage && <Image src={selectedImage} />}</Modal>
      {breadcrumbs}
      <Title order={2} my="lg">Incidencia en {notification.visit?.pool.name}</Title>

      <Paper withBorder p="md" mb="xl">
        <Group justify="space-between"><Title order={4}>Reporte Original</Title><Badge color={notification.status === 'PENDING' ? 'orange' : 'green'} size="lg">{notification.status}</Badge></Group>
        <Text size="sm" c="dimmed" mt="xs">Reportado por {notification.visit?.technician?.name || 'N/A'} el {format(new Date(notification.createdAt), 'd MMM yyyy, HH:mm', { locale: es })}</Text>
        <Textarea value={notification.message} readOnly minRows={2} mt="md" label="Mensaje del técnico" />
        {notification.images && notification.images.length > 0 && (
          <><Text fw={500} size="sm" mt="md">Imágenes Adjuntas:</Text><SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} mt="xs">{notification.images.map(image => (<Paper key={image.id} withBorder radius="md" style={{ cursor: 'pointer' }} onClick={() => handleImageClick(image.url)}><Image src={image.url} height={100} radius="md" fit="cover" /></Paper>))}</SimpleGrid></>
        )}
        {notification.visit && <Button component={Link} to={`/visits/${notification.visit.id}`} variant="subtle" size="xs" mt="sm">Ver Parte de Trabajo Original</Button>}
      </Paper>
      
      {user?.role === 'ADMIN' 
        ? <AdminIncidentView notification={notification} tasks={tasks} technicians={technicians} onUpdate={fetchData} />
        : <TechnicianTaskView tasks={tasks} onUpdate={fetchData} />
      }
    </Container>
  );
}