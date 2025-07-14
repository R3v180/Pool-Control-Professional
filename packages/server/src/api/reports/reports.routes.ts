// filename: packages/server/src/api/reports/reports.routes.ts
// version: 1.2.0 (FEAT: Add route for invoicing report)

import { Router } from 'express';
// --- 1. Importar el nuevo manejador ---
import { 
    getConsumptionReportHandler, 
    getProductConsumptionDetailHandler,
    getInvoicingReportHandler 
} from './reports.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// TODO: Implementar y añadir un middleware de autorización para 'ADMIN' y 'MANAGER'.

const reportsRouter = Router();

// Aplicamos el middleware 'protect' para asegurar que solo usuarios autenticados puedan acceder.
reportsRouter.use(protect);

/**
 * @route   GET /api/reports/consumption
 * @desc    Genera y devuelve un informe detallado de consumo de productos (costes).
 * @access  Private (Admin, Manager)
 */
reportsRouter.get('/consumption', getConsumptionReportHandler);

/**
 * @route   GET /api/reports/consumption/details
 * @desc    Obtiene el detalle de visitas donde se consumió un producto específico.
 * @access  Private (Admin, Manager)
 */
reportsRouter.get('/consumption/details', getProductConsumptionDetailHandler);

/**
 * --- ✅ 2. AÑADIR LA NUEVA RUTA ---
 * @route   GET /api/reports/invoicing
 * @desc    Genera un informe de pre-facturación con precios de venta y cuotas.
 * @access  Private (Admin, Manager)
 */
reportsRouter.get('/invoicing', getInvoicingReportHandler);

export default reportsRouter;