// filename: packages/server/src/api/tasks/tasks.routes.ts
// Version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)

import { Router } from 'express';
import {
  createTaskTemplateHandler,
  deleteTaskTemplateHandler,
  getTaskTemplatesByTenantHandler,
  updateTaskTemplateHandler,
} from './tasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const tasksRouter = Router();

// Aplicamos la protección y autorización a todas las rutas de este fichero.
// Solo los usuarios autenticados con rol de ADMIN pueden gestionar el catálogo.
tasksRouter.use(protect, authorize('ADMIN'));

tasksRouter.route('/')
  .get(getTaskTemplatesByTenantHandler)
  .post(createTaskTemplateHandler);

tasksRouter.route('/:id')
  .patch(updateTaskTemplateHandler)
  .delete(deleteTaskTemplateHandler);

export default tasksRouter;