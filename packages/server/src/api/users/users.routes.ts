// ====== [101] packages/server/src/api/users/users.routes.ts ======
// filename: packages/server/src/api/users/users.routes.ts
// Version: 2.1.0 (FEAT: Adapt routes to use the new controller handler)
// description: The route now points to the new handler for fetching assignable users (technicians and managers).

import { Router } from 'express';
import { getAssignableUsersHandler } from './users.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const usersRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
usersRouter.use(protect);

/**
 * @route   GET /api/users/technicians
 * @desc    Obtiene una lista de todos los usuarios asignables (técnicos y gerentes) del tenant.
 * @access  Private (Admin, Manager)
 */
usersRouter.get('/technicians', authorize('ADMIN', 'MANAGER'), getAssignableUsersHandler);

export default usersRouter;