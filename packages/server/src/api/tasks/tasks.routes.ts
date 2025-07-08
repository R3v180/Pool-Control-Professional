// filename: packages/server/src/api/tasks/tasks.routes.ts
// Version: 1.0.0 (Initial creation of routes for Scheduled Tasks)
import { Router } from 'express';
import {
  createTaskTemplateHandler,
  deleteTaskTemplateHandler,
  getTaskTemplatesByTenantHandler,
  updateTaskTemplateHandler,
} from './tasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const tasksRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
tasksRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

tasksRouter.route('/')
  .get(getTaskTemplatesByTenantHandler)
  .post(createTaskTemplateHandler);

tasksRouter.route('/:id')
  .patch(updateTaskTemplateHandler)
  .delete(deleteTaskTemplateHandler);

export default tasksRouter;