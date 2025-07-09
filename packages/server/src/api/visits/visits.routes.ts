// filename: packages/server/src/api/visits/visits.routes.ts
// Version: 1.1.0 (Add route for visit assignment)
import { Router } from 'express';
import { 
  getScheduledVisitsForWeekHandler,
  assignTechnicianHandler,
} from './visits.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const visitsRouter = Router();

visitsRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

/**
 * @route   GET /api/visits/scheduled
 * @desc    Obtiene las visitas programadas para una semana específica
 * @access  Private (Admin)
 */
visitsRouter.get('/scheduled', getScheduledVisitsForWeekHandler);

/**
 * @route   POST /api/visits/assign
 * @desc    Asigna un técnico a una visita en una fecha específica
 * @access  Private (Admin)
 */
visitsRouter.post('/assign', assignTechnicianHandler);


export default visitsRouter;