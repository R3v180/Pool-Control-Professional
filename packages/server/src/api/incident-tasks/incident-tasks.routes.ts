// filename: packages/server/src/api/incident-tasks/incident-tasks.routes.ts
// version: 2.0.0 (FEAT: Protect routes with granular ADMIN/TECHNICIAN authorization)

import { Router } from 'express';
import {
  createIncidentTaskHandler,
  getTasksByNotificationHandler,
  updateIncidentTaskHandler,
  deleteIncidentTaskHandler,
  getMyAssignedTasksHandler,
  updateTaskStatusHandler,
  addTaskLogHandler,
  getTaskLogsHandler,
  updateTaskDeadlineHandler,
} from './incident-tasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const incidentTasksRouter = Router();

// Todas las rutas de tareas de incidencia requieren autenticación.
incidentTasksRouter.use(protect);

// --- Rutas Generales y de Listado ---
// El técnico ve sus tareas pendientes.
incidentTasksRouter.get('/my-tasks', authorize('TECHNICIAN'), getMyAssignedTasksHandler);
// El admin ve las tareas asociadas a una notificación.
incidentTasksRouter.get('/by-notification/:notificationId', authorize('ADMIN'), getTasksByNotificationHandler);
// Solo el admin puede crear tareas.
incidentTasksRouter.post('/', authorize('ADMIN'), createIncidentTaskHandler);


// --- Rutas para una Tarea Específica por ID ---
// Tanto admin como técnico pueden ver el historial de una tarea.
incidentTasksRouter.get('/:id/logs', authorize('ADMIN', 'TECHNICIAN'), getTaskLogsHandler);
// Tanto admin como técnico pueden añadir comentarios/logs.
incidentTasksRouter.post('/:id/log', authorize('ADMIN', 'TECHNICIAN'), addTaskLogHandler);
// El técnico actualiza el estado (ej: a IN_PROGRESS o COMPLETED).
incidentTasksRouter.patch('/:id/status', authorize('TECHNICIAN'), updateTaskStatusHandler);
// El admin actualiza el plazo (deadline).
incidentTasksRouter.patch('/:id/deadline', authorize('ADMIN'), updateTaskDeadlineHandler);
// El admin edita los detalles principales de la tarea.
incidentTasksRouter.patch('/:id', authorize('ADMIN'), updateIncidentTaskHandler);
// El admin elimina la tarea.
incidentTasksRouter.delete('/:id', authorize('ADMIN'), deleteIncidentTaskHandler);

export default incidentTasksRouter;