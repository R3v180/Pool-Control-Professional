// filename: packages/server/src/api/visits/visits.routes.ts
// Version: 2.2.0 (FEAT: Add route for visit rescheduling)

import { Router } from 'express';
import { 
  getScheduledVisitsForWeekHandler,
  assignTechnicianHandler,
  getMyRouteHandler,
  getVisitDetailsHandler,
  submitWorkOrderHandler,
  createSpecialVisitHandler,
  rescheduleVisitHandler, // ✅ NUEVA IMPORTACIÓN
} from './visits.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const visitsRouter = Router();

// Todas las rutas de visitas requieren que el usuario esté autenticado.
visitsRouter.use(protect);

// --- Rutas a nivel de colección ---
visitsRouter.get('/scheduled', authorize('ADMIN'), getScheduledVisitsForWeekHandler);
visitsRouter.post('/assign', authorize('ADMIN'), assignTechnicianHandler);
visitsRouter.post('/special', authorize('ADMIN'), createSpecialVisitHandler);
visitsRouter.get('/my-route', authorize('TECHNICIAN'), getMyRouteHandler);

// --- Rutas para una visita específica por ID ---
// ✅ NUEVA RUTA PARA REPROGRAMAR
visitsRouter.patch('/:id/reschedule', authorize('ADMIN'), rescheduleVisitHandler);

visitsRouter.post('/:id/complete', authorize('TECHNICIAN'), submitWorkOrderHandler);
visitsRouter.get('/:id', authorize('ADMIN', 'TECHNICIAN'), getVisitDetailsHandler);


export default visitsRouter;