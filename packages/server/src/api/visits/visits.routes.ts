// filename: packages/server/src/api/visits/visits.routes.ts
// Version: 2.0.0 (FEAT: Protect routes with granular ADMIN/TECHNICIAN authorization)

import { Router } from 'express';
import { 
  getScheduledVisitsForWeekHandler,
  assignTechnicianHandler,
  getMyRouteHandler,
  getVisitDetailsHandler,
  submitWorkOrderHandler,
} from './visits.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const visitsRouter = Router();

// Todas las rutas de visitas requieren que el usuario esté autenticado.
visitsRouter.use(protect);

// --- Rutas exclusivas para ADMIN (y MANAGER en vista de Admin) ---
visitsRouter.get('/scheduled', authorize('ADMIN'), getScheduledVisitsForWeekHandler);
visitsRouter.post('/assign', authorize('ADMIN'), assignTechnicianHandler);

// --- Rutas exclusivas para TECHNICIAN (y MANAGER en vista de Técnico) ---
visitsRouter.get('/my-route', authorize('TECHNICIAN'), getMyRouteHandler);
visitsRouter.post('/:id/complete', authorize('TECHNICIAN'), submitWorkOrderHandler);


// --- Rutas compartidas por ADMIN y TECHNICIAN ---

/**
 * @route   GET /api/visits/:id
 * @desc    Obtiene los detalles de una visita específica (para el Parte de Trabajo)
 * @access  Private (Admin, Technician)
 */
// El ADMIN necesita ver los partes completados, el TECHNICIAN necesita ver los pendientes para rellenarlos.
visitsRouter.get('/:id', authorize('ADMIN', 'TECHNICIAN'), getVisitDetailsHandler);

export default visitsRouter;