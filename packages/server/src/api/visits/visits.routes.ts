// filename: packages/server/src/api/visits/visits.routes.ts
// Version: 2.1.0 (FEAT: Add route for special visit creation)

import { Router } from 'express';
import { 
  getScheduledVisitsForWeekHandler,
  assignTechnicianHandler,
  getMyRouteHandler,
  getVisitDetailsHandler,
  submitWorkOrderHandler,
  createSpecialVisitHandler, // ✅ NUEVA IMPORTACIÓN
} from './visits.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const visitsRouter = Router();

// Todas las rutas de visitas requieren que el usuario esté autenticado.
visitsRouter.use(protect);

// --- Rutas exclusivas para ADMIN (y MANAGER en vista de Admin) ---
visitsRouter.get('/scheduled', authorize('ADMIN'), getScheduledVisitsForWeekHandler);
visitsRouter.post('/assign', authorize('ADMIN'), assignTechnicianHandler);

// ✅ --- NUEVA RUTA PARA ÓRDENES DE TRABAJO ESPECIALES ---
visitsRouter.post('/special', authorize('ADMIN'), createSpecialVisitHandler);


// --- Rutas exclusivas para TECHNICIAN (y MANAGER en vista de Técnico) ---
visitsRouter.get('/my-route', authorize('TECHNICIAN'), getMyRouteHandler);
visitsRouter.post('/:id/complete', authorize('TECHNICIAN'), submitWorkOrderHandler);

// --- Rutas compartidas por ADMIN y TECHNICIAN ---
/**
 * @route   GET /api/visits/:id
 * @desc    Obtiene los detalles de una visita específica (para el Parte de Trabajo)
 * @access  Private (Admin, Technician)
 */
visitsRouter.get('/:id', authorize('ADMIN', 'TECHNICIAN'), getVisitDetailsHandler);

export default visitsRouter;