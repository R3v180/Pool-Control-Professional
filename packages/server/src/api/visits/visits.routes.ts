// filename: packages/server/src/api/visits/visits.routes.ts
// Version: 1.0.0 (Initial creation of routes for Visits)
import { Router } from 'express';
import { getScheduledVisitsForWeekHandler } from './visits.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const visitsRouter = Router();

// Aplicamos el middleware 'protect' a TODAS las rutas de este enrutador.
visitsRouter.use(protect);

// TODO: Añadir un middleware de autorización para asegurar que el rol sea 'ADMIN'.

/**
 * @route   GET /api/visits/scheduled
 * @desc    Obtiene las visitas programadas para una semana específica
 * @access  Private (Admin)
 * @query   date - Una fecha ISO (ej. 2025-07-20T10:00:00.000Z) para la semana de interés.
 */
visitsRouter.get('/scheduled', getScheduledVisitsForWeekHandler);


export default visitsRouter;