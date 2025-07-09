// filename: packages/server/src/api/pools/pools.routes.ts
// Version: 1.0.0 (Initial creation of routes for Pool management)
import { Router } from 'express';
import {
  createPoolHandler,
  deletePoolHandler,
  updatePoolHandler,
} from './pools.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const poolsRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
poolsRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

// No hay una ruta GET / aquí porque las piscinas se obtienen
// a través de la ruta del cliente (/api/clients/:id) para mantener el contexto.
poolsRouter.route('/')
  .post(createPoolHandler);

poolsRouter.route('/:id')
  .patch(updatePoolHandler)
  .delete(deletePoolHandler);

export default poolsRouter;