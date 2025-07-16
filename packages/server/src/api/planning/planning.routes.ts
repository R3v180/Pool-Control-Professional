// filename: packages/server/src/api/planning/planning.routes.ts
// version: 1.0.0 (NEW)
// description: Define los endpoints para los datos de planificación agregada.

import { Router } from 'express';
import { getPendingWorkHandler } from './planning.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const planningRouter = Router();

// Todas las rutas de planificación requieren autenticación de ADMIN
planningRouter.use(protect, authorize('ADMIN'));

/**
 * @route   GET /api/planning/pending-work
 * @desc    Obtiene los datos para el "Muelle de Carga" (visitas vencidas, huérfanas, etc.).
 * @access  Private (Admin)
 */
planningRouter.get('/pending-work', getPendingWorkHandler);

export default planningRouter;