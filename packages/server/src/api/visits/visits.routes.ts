// filename: packages/server/src/api/visits/visits.routes.ts
// Version: 1.4.4 (Clean up unused imports and finalize route order)
import { Router } from 'express';
import { 
  getScheduledVisitsForWeekHandler,
  assignTechnicianHandler,
  getMyRouteHandler,
  getVisitDetailsHandler,
  submitWorkOrderHandler,
} from './visits.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const visitsRouter = Router();

visitsRouter.use(protect);

// --- Rutas para ADMIN ---
visitsRouter.get('/scheduled', getScheduledVisitsForWeekHandler);
visitsRouter.post('/assign', assignTechnicianHandler);

// --- Rutas para TECHNICIAN ---
visitsRouter.get('/my-route', getMyRouteHandler);

/**
 * @route   POST /api/visits/:id/complete
 * @desc    Envía y procesa los datos de un Parte de Trabajo.
 * @access  Private (Technician)
 */
visitsRouter.post('/:id/complete', submitWorkOrderHandler);

/**
 * @route   GET /api/visits/:id
 * @desc    Obtiene los detalles de una visita específica (para el Parte de Trabajo)
 * @access  Private (Technician/Admin)
 */
visitsRouter.get('/:id', getVisitDetailsHandler);

export default visitsRouter;