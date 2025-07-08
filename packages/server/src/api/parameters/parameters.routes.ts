// filename: packages/server/src/api/parameters/parameters.routes.ts
// Version: 1.0.0 (Initial creation of routes for Parameter Templates)
import { Router } from 'express';
import {
  createParameterTemplateHandler,
  deleteParameterTemplateHandler,
  getParameterTemplatesByTenantHandler,
  updateParameterTemplateHandler,
} from './parameters.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const parametersRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas definidas en este archivo.
// Esto asegura que solo los usuarios autenticados pueden gestionar el catálogo.
parametersRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

parametersRouter.route('/')
  .get(getParameterTemplatesByTenantHandler)
  .post(createParameterTemplateHandler);

parametersRouter.route('/:id')
  .patch(updateParameterTemplateHandler)
  .delete(deleteParameterTemplateHandler);

export default parametersRouter;