// filename: packages/server/src/api/users/users.routes.ts
// Version: 2.2.0 (FEAT: Add route to update user availability)
// description: Adds a PATCH route for an admin to update a user's availability status.

import { Router } from 'express';
import { getAssignableUsersHandler, updateUserAvailabilityHandler } from './users.controller.js';
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

/**
 * @route   PATCH /api/users/:id/availability
 * @desc    Actualiza el estado de disponibilidad de un usuario.
 * @access  Private (Admin)
 */
usersRouter.patch('/:id/availability', authorize('ADMIN'), updateUserAvailabilityHandler);


export default usersRouter;