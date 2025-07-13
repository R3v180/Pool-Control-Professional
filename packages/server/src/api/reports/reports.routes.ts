// filename: packages/server/src/api/reports/reports.routes.ts
// version: 1.0.0
// description: Define las rutas de la API para los informes.

import { Router } from 'express';
import { getConsumptionReportHandler } from './reports.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// TODO: Implementar y añadir un middleware de autorización para 'ADMIN' y 'MANAGER'.

const reportsRouter = Router();

// Aplicamos el middleware 'protect' para asegurar que solo usuarios autenticados puedan acceder.
reportsRouter.use(protect);

/**
 * @route   GET /api/reports/consumption
 * @desc    Genera y devuelve un informe detallado de consumo de productos.
 * @access  Private (Admin, Manager)
 */
reportsRouter.get('/consumption', getConsumptionReportHandler);

export default reportsRouter;