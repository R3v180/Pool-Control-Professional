// filename: packages/server/src/api/clients/clients.routes.ts
// Version: 1.0.0 (Initial creation of routes for Client management)
import { Router } from 'express';
import {
  createClientHandler,
  deleteClientHandler,
  getClientByIdHandler,
  getClientsByTenantHandler,
  updateClientHandler,
} from './clients.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const clientsRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
clientsRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

clientsRouter.route('/')
  .get(getClientsByTenantHandler)
  .post(createClientHandler);

clientsRouter.route('/:id')
  .get(getClientByIdHandler)
  .patch(updateClientHandler)
  .delete(deleteClientHandler);

export default clientsRouter;