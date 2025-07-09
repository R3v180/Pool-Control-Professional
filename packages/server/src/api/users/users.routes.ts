// filename: packages/server/src/api/users/users.routes.ts
// Version: 1.0.0 (Initial creation of routes for User queries)
import { Router } from 'express';
import { getTechniciansByTenantHandler } from './users.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const usersRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
usersRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

/**
 * @route   GET /api/users/technicians
 * @desc    Obtiene una lista de todos los técnicos del tenant.
 * @access  Private (Admin)
 */
usersRouter.get('/technicians', getTechniciansByTenantHandler);


export default usersRouter;