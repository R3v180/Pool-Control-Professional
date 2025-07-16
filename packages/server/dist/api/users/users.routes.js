// filename: packages/server/src/api/users/users.routes.ts
// version: 2.3.0 (FEAT: Add routes for managing UserAvailability)
import { Router } from 'express';
// ✅ CORRECCIÓN: Importar los nuevos manejadores
import { getAssignableUsersHandler, updateUserAvailabilityHandler, getUserAvailabilitiesHandler, setUserAvailabilityHandler, } from './users.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const usersRouter = Router();
usersRouter.use(protect);
/**
 * @route   GET /api/users/technicians
 * @desc    Obtiene una lista de todos los usuarios asignables (técnicos y gerentes) del tenant.
 * @access  Private (Admin, Manager)
 */
usersRouter.get('/technicians', authorize('ADMIN', 'MANAGER'), getAssignableUsersHandler);
/**
 * @route   PATCH /api/users/:id/availability
 * @desc    Actualiza el estado de disponibilidad INMEDIATA de un usuario.
 * @access  Private (Admin)
 */
usersRouter.patch('/:id/availability', authorize('ADMIN'), updateUserAvailabilityHandler);
// --- ✅ NUEVAS RUTAS PARA GESTIONAR AUSENCIAS PLANIFICADAS ---
/**
 * @route   GET /api/users/:id/availabilities
 * @desc    Obtiene todos los periodos de ausencia planificados para un usuario.
 * @access  Private (Admin)
 */
usersRouter.get('/:id/availabilities', authorize('ADMIN'), getUserAvailabilitiesHandler);
/**
 * @route   POST /api/users/availability
 * @desc    Crea un nuevo periodo de ausencia para un usuario.
 * @access  Private (Admin)
 */
usersRouter.post('/availability', authorize('ADMIN'), setUserAvailabilityHandler);
export default usersRouter;
