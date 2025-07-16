// filename: packages/server/src/api/parameters/parameters.routes.ts
// Version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)
import { Router } from 'express';
import { createParameterTemplateHandler, deleteParameterTemplateHandler, getParameterTemplatesByTenantHandler, updateParameterTemplateHandler, } from './parameters.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const parametersRouter = Router();
// Aplicamos la protección y autorización a todas las rutas de este fichero.
// Solo los usuarios autenticados con rol de ADMIN pueden gestionar el catálogo.
parametersRouter.use(protect, authorize('ADMIN'));
parametersRouter.route('/')
    .get(getParameterTemplatesByTenantHandler)
    .post(createParameterTemplateHandler);
parametersRouter.route('/:id')
    .patch(updateParameterTemplateHandler)
    .delete(deleteParameterTemplateHandler);
export default parametersRouter;
