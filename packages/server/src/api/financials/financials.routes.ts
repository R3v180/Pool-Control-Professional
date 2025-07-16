// filename: packages/server/src/api/financials/financials.routes.ts
// version: 1.0.0 (NEW)
// description: Define los endpoints de la API para los nuevos informes y datos financieros.

import { Router } from 'express';
import { getAccountStatusHandler } from './financials.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const financialsRouter = Router();

// Todas las rutas de finanzas requieren autenticación de ADMIN o MANAGER.
financialsRouter.use(protect, authorize('ADMIN', 'MANAGER'));

/**
 * @route   GET /api/financials/account-status
 * @desc    Obtiene un resumen del estado de cuentas (facturado, pagado, saldo) de todos los clientes para un mes determinado.
 * @access  Private (Admin, Manager)
 */
financialsRouter.get('/account-status', getAccountStatusHandler);


export default financialsRouter;