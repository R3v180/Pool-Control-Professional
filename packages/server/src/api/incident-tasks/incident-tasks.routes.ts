// filename: packages/server/src/api/incident-tasks/incident-tasks.routes.ts
// version: 1.3.0 (Adds route to update a task's deadline)

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
  updateTaskDeadlineHandler, // <-- 1. Importar el nuevo manejador (aún no creado)
} from './incident-tasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const incidentTasksRouter = Router();

incidentTasksRouter.use(protect);

// --- Rutas Generales y de Listado ---
incidentTasksRouter.get('/my-tasks', getMyAssignedTasksHandler);
incidentTasksRouter.get('/by-notification/:notificationId', getTasksByNotificationHandler);
incidentTasksRouter.post('/', createIncidentTaskHandler);

// --- Rutas para una Tarea Específica por ID ---
incidentTasksRouter.get('/:id/logs', getTaskLogsHandler);
incidentTasksRouter.post('/:id/log', addTaskLogHandler);
incidentTasksRouter.patch('/:id/status', updateTaskStatusHandler);
incidentTasksRouter.patch('/:id/deadline', updateTaskDeadlineHandler); // <-- 2. Añadir la nueva ruta
incidentTasksRouter.patch('/:id', updateIncidentTaskHandler);
incidentTasksRouter.delete('/:id', deleteIncidentTaskHandler);

export default incidentTasksRouter;