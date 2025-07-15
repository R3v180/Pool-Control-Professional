// filename: packages/server/src/api/users/users.routes.ts
// Version: 2.0.0 (FEAT: Protect routes with ADMIN/MANAGER authorization)

import { Router } from 'express';
import { getTechniciansByTenantHandler } from './users.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const usersRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
usersRouter.use(protect);

/**
 * @route   GET /api/users/technicians
 * @desc    Obtiene una lista de todos los técnicos del tenant.
 * @access  Private (Admin, Manager)
 */
usersRouter.get('/technicians', authorize('ADMIN', 'MANAGER'), getTechniciansByTenantHandler);


export default usersRouter;