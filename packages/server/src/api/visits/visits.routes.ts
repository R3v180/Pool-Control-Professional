// filename: packages/server/src/api/visits/visits.routes.ts
// Version: 1.2.0 (Add route for a technician to get their daily route)
import { Router } from 'express';
import { 
  getScheduledVisitsForWeekHandler,
  assignTechnicianHandler,
  getMyRouteHandler,
} from './visits.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const visitsRouter = Router();

visitsRouter.use(protect);

/**
 * @route   GET /api/visits/scheduled
 * @desc    Obtiene las visitas programadas para una semana (ADMIN)
 * @access  Private (Admin)
 */
visitsRouter.get('/scheduled', getScheduledVisitsForWeekHandler);

/**
 * @route   POST /api/visits/assign
 * @desc    Asigna un técnico a una visita (ADMIN)
 * @access  Private (Admin)
 */
visitsRouter.post('/assign', assignTechnicianHandler);

/**
 * @route   GET /api/visits/my-route
 * @desc    Obtiene la ruta del día para el técnico logueado (TECHNICIAN)
 * @access  Private (Technician)
 */
visitsRouter.get('/my-route', getMyRouteHandler);


export default visitsRouter;