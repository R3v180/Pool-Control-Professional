// filename: packages/server/src/api/route-templates/route-templates.routes.ts
// version: 1.0.0
// description: Define los endpoints de la API para el recurso de Rutas Maestras.

import { Router } from 'express';
import {
  createRouteTemplateHandler,
  getRouteTemplatesHandler,
  getRouteTemplateByIdHandler,
  updateRouteTemplateHandler,
  deleteRouteTemplateHandler,
} from './route-templates.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const routeTemplatesRouter = Router();

// Aplicamos la seguridad a todas las rutas de este fichero.
// Solo los administradores podrán gestionar las rutas maestras.
routeTemplatesRouter.use(protect, authorize('ADMIN'));

// Rutas para /api/route-templates
routeTemplatesRouter.route('/')
  .get(getRouteTemplatesHandler)
  .post(createRouteTemplateHandler);

// Rutas para una ruta específica /api/route-templates/:id
routeTemplatesRouter.route('/:id')
  .get(getRouteTemplateByIdHandler)
  .patch(updateRouteTemplateHandler)
  .delete(deleteRouteTemplateHandler);

export default routeTemplatesRouter;