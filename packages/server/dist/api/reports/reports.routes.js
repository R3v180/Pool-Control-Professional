// filename: packages/server/src/api/reports/reports.routes.ts
// version: 2.0.0 (FEAT: Protect routes with ADMIN/MANAGER authorization)
import { Router } from 'express';
import { getConsumptionReportHandler, getProductConsumptionDetailHandler, getInvoicingReportHandler } from './reports.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const reportsRouter = Router();
// Aplicamos la protección en dos niveles a todas las rutas de informes:
// 1. `protect`: Asegura que el usuario esté autenticado.
// 2. `authorize('ADMIN', 'MANAGER')`: Asegura que el usuario sea Admin o Manager.
reportsRouter.use(protect, authorize('ADMIN', 'MANAGER'));
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
 * @route   GET /api/reports/invoicing
 * @desc    Genera un informe de pre-facturación con precios de venta y cuotas.
 * @access  Private (Admin, Manager)
 */
reportsRouter.get('/invoicing', getInvoicingReportHandler);
export default reportsRouter;
