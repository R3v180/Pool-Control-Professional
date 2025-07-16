// filename: packages/server/src/api/visits/visits.routes.ts
// version: 2.2.1 (FIX: Allow MANAGER to view visit details)
// description: Se corrige un bug de permisos permitiendo que el rol de MANAGER también pueda acceder a los detalles de una visita.

import { Router } from 'express';
import { 
  getScheduledVisitsForWeekHandler,
  assignTechnicianHandler,
  getMyRouteHandler,
  getVisitDetailsHandler,
  submitWorkOrderHandler,
  createSpecialVisitHandler,
  rescheduleVisitHandler,
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
visitsRouter.patch('/:id/reschedule', authorize('ADMIN'), rescheduleVisitHandler);
visitsRouter.post('/:id/complete', authorize('TECHNICIAN'), submitWorkOrderHandler);

// ✅ CORRECCIÓN: Se añade el rol 'MANAGER' a la autorización.
visitsRouter.get('/:id', authorize('ADMIN', 'TECHNICIAN', 'MANAGER'), getVisitDetailsHandler);

export default visitsRouter;