// filename: packages/server/src/api/dashboard/dashboard.routes.ts
// version: 1.0.0
// description: Define el endpoint de la API para los datos del Dashboard de Gerencia.

import { Router } from 'express';
import { getManagerDashboardHandler } from './dashboard.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const dashboardRouter = Router();

// Protegemos la ruta para que solo usuarios autenticados puedan acceder.
dashboardRouter.use(protect);

/**
 * @route   GET /api/dashboard/manager
 * @desc    Obtiene todos los datos agregados para el Dashboard de Gerencia.
 * @access  Private (Manager)
 */
dashboardRouter.get('/manager', getManagerDashboardHandler);

export default dashboardRouter;