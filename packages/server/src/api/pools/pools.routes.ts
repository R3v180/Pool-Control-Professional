// filename: packages/server/src/api/pools/pools.routes.ts
// Version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)

import { Router } from 'express';
import {
  createPoolHandler,
  deletePoolHandler,
  updatePoolHandler,
} from './pools.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const poolsRouter = Router();

// Aplicamos la protección en dos niveles a TODAS las rutas de este enrutador:
// 1. `protect`: Asegura que el usuario esté autenticado.
// 2. `authorize('ADMIN')`: Asegura que el usuario autenticado tenga el rol de ADMIN.
poolsRouter.use(protect, authorize('ADMIN'));


// No hay una ruta GET / aquí porque las piscinas se obtienen
// a través de la ruta del cliente (/api/clients/:id) para mantener el contexto.
poolsRouter.route('/')
  .post(createPoolHandler);

poolsRouter.route('/:id')
  .patch(updatePoolHandler)
  .delete(deletePoolHandler);

export default poolsRouter;