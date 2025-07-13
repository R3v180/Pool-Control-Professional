// filename: packages/server/src/api/reports/reports.routes.ts
// version: 1.1.0 (FEAT: Add route for consumption details)

import { Router } from 'express';
// ✅ 1. IMPORTAR EL NUEVO MANEJADOR
import { getConsumptionReportHandler, getProductConsumptionDetailHandler } from './reports.controller.js';
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


/**
 * ✅ 2. AÑADIR LA NUEVA RUTA
 * @route   GET /api/reports/consumption/details
 * @desc    Obtiene el detalle de visitas donde se consumió un producto específico.
 * @access  Private (Admin, Manager)
 */
reportsRouter.get('/consumption/details', getProductConsumptionDetailHandler);


export default reportsRouter;