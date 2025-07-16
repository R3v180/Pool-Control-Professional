// filename: packages/server/src/api/incident-tasks/incident-tasks.routes.ts
// version: 2.0.2 (FIX: Allow MANAGER to create and edit incident tasks)
// description: Se expanden los permisos para permitir que el rol MANAGER pueda crear, editar y eliminar tareas de incidencia, consolidando su capacidad para actuar como Admin.

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

// El admin o el manager ven las tareas asociadas a una notificación.
incidentTasksRouter.get('/by-notification/:notificationId', authorize('ADMIN', 'MANAGER'), getTasksByNotificationHandler);

// ✅ CORRECCIÓN: Se permite a ADMIN y MANAGER crear tareas
incidentTasksRouter.post('/', authorize('ADMIN', 'MANAGER'), createIncidentTaskHandler);


// --- Rutas para una Tarea Específica por ID ---
// Todos los roles autorizados pueden ver el historial.
incidentTasksRouter.get('/:id/logs', authorize('ADMIN', 'TECHNICIAN', 'MANAGER'), getTaskLogsHandler);

// Admin y Técnico pueden añadir comentarios.
incidentTasksRouter.post('/:id/log', authorize('ADMIN', 'TECHNICIAN'), addTaskLogHandler);

// El técnico actualiza el estado.
incidentTasksRouter.patch('/:id/status', authorize('TECHNICIAN'), updateTaskStatusHandler);

// ✅ CORRECCIÓN: Se permite a ADMIN y MANAGER actualizar el plazo
incidentTasksRouter.patch('/:id/deadline', authorize('ADMIN', 'MANAGER'), updateTaskDeadlineHandler);

// ✅ CORRECCIÓN: Se permite a ADMIN y MANAGER editar la tarea
incidentTasksRouter.patch('/:id', authorize('ADMIN', 'MANAGER'), updateIncidentTaskHandler);

// ✅ CORRECCIÓN: Se permite a ADMIN y MANAGER eliminar la tarea
incidentTasksRouter.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteIncidentTaskHandler);

export default incidentTasksRouter;