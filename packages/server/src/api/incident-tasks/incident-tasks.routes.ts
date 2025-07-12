// filename: packages/server/src/api/incident-tasks/incident-tasks.routes.ts
// version: 1.2.0 (Adds status, log, and get-logs routes)
// description: Añade los endpoints para el ciclo de vida y auditoría de una tarea.

import { Router } from 'express';
import {
  createIncidentTaskHandler,
  getTasksByNotificationHandler,
  updateIncidentTaskHandler,
  deleteIncidentTaskHandler,
  getMyAssignedTasksHandler,
  updateTaskStatusHandler, // <-- Importar
  addTaskLogHandler,       // <-- Importar
  getTaskLogsHandler,      // <-- Importar
} from './incident-tasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const incidentTasksRouter = Router();

incidentTasksRouter.use(protect);

// --- Rutas Generales y de Listado ---
incidentTasksRouter.get('/my-tasks', getMyAssignedTasksHandler);
incidentTasksRouter.get('/by-notification/:notificationId', getTasksByNotificationHandler);
incidentTasksRouter.post('/', createIncidentTaskHandler);

// --- Rutas para una Tarea Específica por ID ---
incidentTasksRouter.get('/:id/logs', getTaskLogsHandler); // Obtener historial de una tarea
incidentTasksRouter.post('/:id/log', addTaskLogHandler);   // Añadir un comentario/log
incidentTasksRouter.patch('/:id/status', updateTaskStatusHandler); // Cambiar estado
incidentTasksRouter.patch('/:id', updateIncidentTaskHandler);      // Editar detalles generales
incidentTasksRouter.delete('/:id', deleteIncidentTaskHandler);     // Eliminar tarea

export default incidentTasksRouter;