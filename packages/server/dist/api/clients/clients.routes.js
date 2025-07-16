// filename: packages/server/src/api/clients/clients.routes.ts
// Version: 2.0.0 (FEAT: Protect routes with ADMIN/MANAGER authorization)
import { Router } from 'express';
import { createClientHandler, deleteClientHandler, getClientByIdHandler, getClientsByTenantHandler, updateClientHandler, } from './clients.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const clientsRouter = Router();
// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
clientsRouter.use(protect);
// Las rutas para listar y crear clientes solo son accesibles para ADMINS.
clientsRouter.route('/')
    .get(authorize('ADMIN', 'MANAGER'), getClientsByTenantHandler)
    .post(authorize('ADMIN'), createClientHandler);
// Las rutas para un cliente específico son accesibles para ADMIN y MANAGER para ver,
// pero solo para ADMIN para modificar o eliminar.
// Esto permite al MANAGER ver los detalles del cliente desde su dashboard.
clientsRouter.route('/:id')
    .get(authorize('ADMIN', 'MANAGER'), getClientByIdHandler)
    .patch(authorize('ADMIN'), updateClientHandler)
    .delete(authorize('ADMIN'), deleteClientHandler);
export default clientsRouter;
