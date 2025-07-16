// filename: packages/client/src/features/admin/pages/incidents/IncidentDetailPage.tsx
// version: 2.8.3 (FIX: Use activeRole for view rendering - full version)
// description: Se corrige el bug que impedía al Manager ver la vista de Admin en el detalle de incidencia. Ahora se utiliza `activeRole` en lugar de `user.role` para decidir qué vista renderizar.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Title, Loader, Alert, Paper, Text, Breadcrumbs, Button, Group,
  Modal, TextInput, Stack, Textarea, Select, Badge, Card, ActionIcon, Divider, SimpleGrid, Image, Tooltip
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
type LogAction = 'CREATION' | 'STATUS_CHANGE' | 'COMMENT' | 'DEADLINE_REQUEST' | 'DEADLINE_UPDATE';

interface User { id: string; name: string; }
interface IncidentImage { id: string; url: string; }
interface IncidentTaskLog { id: string, action: LogAction, details: string, createdAt: string, user: { name: string } }
interface IncidentTask {
  id: string; title: string; description: string | null; status: IncidentTaskStatus;
  priority: IncidentPriority; deadline: string | null; assignedTo: User | null; resolutionNotes: string | null;
}
interface NotificationDetails {
  id:string; message: string; status: IncidentStatus; priority: IncidentPriority | null;
  images: IncidentImage[];
  visit: { id: string; timestamp: string; pool: { name: string; }; technician: { name: string } | null; } | null;
}
interface ApiResponse<T> { success: boolean; data: T; }
const taskStatusColors: Record<IncidentTaskStatus, string> = { PENDING: 'gray', IN_PROGRESS: 'blue', COMPLETED: 'green', CANCELLED: 'red' };
const priorityColors: Record<IncidentPriority, string> = { LOW: 'gray', NORMAL: 'blue', HIGH: 'orange', CRITICAL: 'red' };


const TechnicianTaskView = ({ tasks, onUpdate }: { tasks: IncidentTask[], onUpdate: () => void }) => {
  const { user } = useAuth();
  const myTask = tasks.find(t => t.assignedTo?.id === user?.id);

  const [comment, setComment] = useState('');
  const [newDeadline, setNewDeadline] = useState<Date | null>(null);
  const [logs, setLogs] = useState<IncidentTaskLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const handleStatusChange = async (status: IncidentTaskStatus, resolutionNotes?: string) => {
    if (!myTask) return;
    await apiClient.patch(`/incident-tasks/${myTask.id}/status`, { status, resolutionNotes });
    onUpdate();
  };

  const fetchLogs = async () => {
    if (!myTask) return;
    try {
      const response = await apiClient.get<ApiResponse<IncidentTaskLog[]>>(`/incident-tasks/${myTask.id}/logs`);
      setLogs(response.data.data);
    } catch {
      alert('No se pudo cargar el historial de la tarea.');
    }
  };

  const handleAddLog = async () => {
    if (!myTask || !comment) return;
    await apiClient.post(`/incident-tasks/${myTask.id}/log`, {
      details: comment,
      newDeadline: newDeadline instanceof Date ? newDeadline.toISOString() : undefined,
    });
    setComment('');
    setNewDeadline(null);
    if(showHistory) {
      fetchLogs();
    }
  };

  const toggleHistory = () => {
    const willBeOpen = !showHistory;
    setShowHistory(willBeOpen);
    if (willBeOpen && logs.length === 0) {
      fetchLogs();
    }
  };

  if (!myTask) {
    return <Alert color="orange">No tienes una tarea específica asignada para esta incidencia.</Alert>
  }

  const isOverdue = myTask.deadline && new Date(myTask.deadline) < new Date() && myTask.status !== 'COMPLETED';

  return (
    <Stack>
      <Title order={3}>Tarea Asignada: {myTask.title}</Title>
      <Text c="dimmed">{myTask.description}</Text>
      <Group>
        <Badge color={taskStatusColors[myTask.status]}>{myTask.status}</Badge>
        <Badge color={priorityColors[myTask.priority]}>Prioridad: {myTask.priority}</Badge>
        <Button variant="subtle" size="xs" onClick={toggleHistory}>
          {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
        </Button>
      </Group>

      {myTask.deadline && (
       <Text size="sm" c={isOverdue ? 'red' : 'dimmed'} fw={isOverdue ? 700 : 400} mt="xs">
          Plazo: {format(new Date(myTask.deadline), 'eeee, d MMMM yyyy, HH:mm', { locale: es })} {isOverdue && '(VENCIDA)'}
        </Text>
      )}

      {showHistory && (
        <Paper withBorder p="md" mt="sm">
            <Title order={5} mb="sm">Historial de la Tarea</Title>
            <Stack gap="xs">
                {logs.length > 0 
                    ? logs.map(log => (
                        <Paper key={log.id} p="xs" bg="gray.0" radius="sm">
                            <Text size="xs">
                                <strong>{log.user.name}</strong> ({format(new Date(log.createdAt), 'dd/MM HH:mm')})
                            </Text>
                            <Text size="sm" mt={4}>{log.details}</Text>
                        </Paper>
                    ))
                    : <Text size="sm" c="dimmed">No hay entradas en el historial.</Text>
                }
            </Stack>
        </Paper>
      )}

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
          onChange={setNewDeadline as any}
          mt="sm"
        />
        <Button mt="md" onClick={handleAddLog} disabled={!comment}>Enviar Actualización</Button>
      </Paper>
    </Stack>
  );
};


const AdminIncidentView = ({ notification, tasks, technicians, onUpdate }: { notification: NotificationDetails, tasks: IncidentTask[], technicians: User[], onUpdate: () => void }) => {
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState<IncidentTask | null>(null);
  const [logs, setLogs] = useState<IncidentTaskLog[]>([]);
  const [selectedTaskForLogs, setSelectedTaskForLogs] = useState<IncidentTask | null>(null);
  const [adminComment, setAdminComment] = useState('');
  
  const form = useForm({
    initialValues: {
      title: '', description: '', priority: 'NORMAL' as IncidentPriority,
      assignedToId: null as string | null, deadline: null as Date | null,
    },
    validate: { title: (value) => (value.trim().length < 5 ? 'El título es demasiado corto.' : null) },
  });

  const handleOpenModal = (task: IncidentTask | null = null) => {
    setEditingTask(task);
    if (task) {
      const deadlineDate = task.deadline ? new Date(task.deadline) : null;
      form.setValues({
        title: task.title, description: task.description || '', priority: task.priority,
        assignedToId: task.assignedTo?.id || null, deadline: deadlineDate,
      });
    } else {
      form.reset();
      form.setFieldValue('priority', 'NORMAL');
    }
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    const isNewTask = !editingTask;
    const taskId = isNewTask ? null : editingTask!.id;

    const payload: { [key: string]: any } = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      assignedToId: values.assignedToId,
      deadline: values.deadline instanceof Date ? values.deadline.toISOString() : null,
    };

    try {
      if (isNewTask) {
        await apiClient.post('/incident-tasks', { ...payload, notificationId: notification.id });
      } else {
        await apiClient.patch(`/incident-tasks/${taskId}`, payload);
      }
      onUpdate();
      closeModal();
    } catch (err: any) {
      form.setErrors({ title: err.response?.data?.message || 'Error al guardar la tarea.' });
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('¿Estás seguro?')) { try { await apiClient.delete(`/incident-tasks/${taskId}`); onUpdate(); } catch (err) { alert('No se pudo eliminar la tarea.'); } }
  };

  const handleViewLogs = async (task: IncidentTask) => {
    if (selectedTaskForLogs?.id === task.id) {
      setSelectedTaskForLogs(null);
      setLogs([]);
      return;
    }
    setSelectedTaskForLogs(task);
    try {
      const response = await apiClient.get<ApiResponse<IncidentTaskLog[]>>(`/incident-tasks/${task.id}/logs`);
      setLogs(response.data.data);
    } catch {
      alert('No se pudo cargar el historial de la tarea.');
    }
  };

  useEffect(() => {
    if (tasks.length === 1 && !selectedTaskForLogs) {
      if (tasks[0]) {
        handleViewLogs(tasks[0]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]); 
  
  const handleAcceptDeadline = async (taskId: string, logDetails: string) => {
    const dateString = logDetails.split('para: ')[1];
    if (!dateString) return;
    const newDate = new Date(dateString.replace(' a las', '')); // Ajuste para parsear
    if (isNaN(newDate.getTime())) return;
    
    try {
      await apiClient.patch(`/incident-tasks/${taskId}/deadline`, { deadline: newDate.toISOString() });
      onUpdate();
    } catch {
      alert('No se pudo aceptar el nuevo plazo.');
    }
  };

  const handleAdminComment = async (taskId: string) => {
    if (!adminComment.trim()) return;
    try {
      await apiClient.post(`/incident-tasks/${taskId}/log`, { details: adminComment });
      setAdminComment('');
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (taskToUpdate) {
        handleViewLogs(taskToUpdate);
      }
      onUpdate();
    } catch {
      alert('No se pudo enviar el comentario.');
    }
  };
  
  const technicianOptions = technicians.map(t => ({ value: t.id, label: t.name }));

  const renderLogEntry = (log: IncidentTaskLog, taskId: string) => {
    const isRequest = log.action === 'DEADLINE_REQUEST';
    return (
        <Paper key={log.id} p="xs" withBorder={isRequest} shadow={isRequest ? "sm" : "none"} radius="md" bg={isRequest ? 'blue.0' : 'gray.0'}>
            <Text size="xs">
                <strong>{log.user.name}</strong> ({format(new Date(log.createdAt), 'dd/MM HH:mm', { locale: es })})
            </Text>
            <Text size="sm" mt={4}>{log.details}</Text>
            {isRequest && (
                <Group mt="xs">
                    <Button size="xs" color="green" onClick={() => handleAcceptDeadline(taskId, log.details)}>Aceptar Plazo</Button>
                </Group>
            )}
        </Paper>
    );
  };

  return (
    <>
      <Modal opened={modalOpened} onClose={closeModal} title={editingTask ? 'Editar Tarea' : 'Crear Tarea'} centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput required label="Título" {...form.getInputProps('title')} />
            <Textarea label="Descripción" {...form.getInputProps('description')} />
            <Select label="Prioridad" data={['LOW', 'NORMAL', 'HIGH', 'CRITICAL']} required {...form.getInputProps('priority')} />
            <Select label="Asignar a" data={technicianOptions} clearable {...form.getInputProps('assignedToId')} />
            <DateTimePicker
              label="Plazo Límite"
              locale="es"
              clearable
              value={form.values.deadline}
              onChange={(value) => form.setFieldValue('deadline', value ? new Date(value) : null)}
            />
            <Button type="submit" mt="md">{editingTask ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
          </Stack>
        </form>
      </Modal>

      <Group justify="space-between" align="center" mb="md"><Title order={3}>Tareas de Seguimiento</Title><Button onClick={() => handleOpenModal()}>+ Crear Tarea</Button></Group>
      
      <Stack>
        {tasks.length > 0 ? (
          tasks.map(task => {
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';
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
                    
                    {selectedTaskForLogs?.id === task.id && (
                      <Stack mt="sm" gap="xs">
                        {logs.length > 0 
                            ? logs.map(log => renderLogEntry(log, task.id))
                            : <Text size="xs" c="dimmed">No hay historial para esta tarea.</Text>
                        }
                        <Textarea
                          placeholder="Escribe una respuesta o nueva instrucción para el técnico..."
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.currentTarget.value)}
                          minRows={2}
                        />
                        <Button size="xs" onClick={() => handleAdminComment(task.id)} disabled={!adminComment.trim()}>Enviar Comentario</Button>
                      </Stack>
                    )}

                  </Stack>
                  <Stack>
                    <Tooltip label="Editar detalles de la tarea">
                      <ActionIcon variant="default" onClick={() => handleOpenModal(task)}>✏️</ActionIcon>
                    </Tooltip>
                    <Tooltip label="Ver/Ocultar diálogo e historial">
                      <ActionIcon variant="default" onClick={() => handleViewLogs(task)}>💬</ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar tarea">
                      <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(task.id)}>🗑️</ActionIcon>
                    </Tooltip>
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


// --- COMPONENTE PRINCIPAL (DESPACHADOR) ---
export function IncidentDetailPage() {
  const { notificationId } = useParams<{ notificationId: string }>();
  const { activeRole } = useAuth();
  
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

  const breadcrumbs = (<Breadcrumbs><Link to={activeRole === 'ADMIN' ? "/incidents-history" : "/my-route"}>{activeRole === 'ADMIN' ? "Gestión de Incidencias" : "Mi Trabajo de Hoy"}</Link><Text>Detalle</Text></Breadcrumbs>);

  return (
    <Container fluid>
      <Modal opened={imageModalOpened} onClose={closeImageModal} title="Imagen de la Incidencia" centered size="xl">{selectedImage && <Image src={selectedImage} />}</Modal>
      {breadcrumbs}
      <Title order={2} my="lg">Incidencia en {notification.visit?.pool.name}</Title>

      <Paper withBorder p="md" mb="xl">
        <Group justify="space-between"><Title order={4}>Reporte Original</Title><Badge color={notification.status === 'PENDING' ? 'orange' : 'green'} size="lg">{notification.status}</Badge></Group>
        
        <Text size="sm" c="dimmed" mt="xs">
          Reportado por {notification.visit?.technician?.name || 'Sistema'}
          {notification.visit?.timestamp && ` el ${format(new Date(notification.visit.timestamp), 'd MMM yyyy, HH:mm', { locale: es })}`}
        </Text>

        <Textarea value={notification.message} readOnly minRows={2} mt="md" label="Mensaje del técnico" />
        {notification.images && notification.images.length > 0 && (
          <><Text fw={500} size="sm" mt="md">Imágenes Adjuntas:</Text><SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} mt="xs">{notification.images.map(image => (<Paper key={image.id} withBorder radius="md" style={{ cursor: 'pointer' }} onClick={() => handleImageClick(image.url)}><Image src={image.url} height={100} radius="md" fit="cover" /></Paper>))}</SimpleGrid></>
        )}
        {notification.visit && <Button component={Link} to={`/visits/${notification.visit.id}`} variant="subtle" size="xs" mt="sm">Ver Parte de Trabajo Original</Button>}
      </Paper>
      
      {activeRole === 'ADMIN' 
        ? <AdminIncidentView notification={notification} tasks={tasks} technicians={technicians} onUpdate={fetchData} />
        : <TechnicianTaskView tasks={tasks} onUpdate={fetchData} />
      }
    </Container>
  );
}