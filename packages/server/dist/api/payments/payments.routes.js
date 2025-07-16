// filename: packages/server/src/api/payments/payments.routes.ts
// version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)
import { Router } from 'express';
import { createPaymentHandler, getPaymentsByClientHandler, deletePaymentHandler, } from './payments.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const paymentsRouter = Router();
// Protegemos todas las rutas de este módulo.
// Solo los usuarios autenticados con rol de ADMIN pueden gestionar los pagos.
paymentsRouter.use(protect, authorize('ADMIN'));
// Ruta para crear un nuevo pago
paymentsRouter.post('/', createPaymentHandler);
// Ruta para obtener todos los pagos de un cliente específico
paymentsRouter.get('/by-client/:clientId', getPaymentsByClientHandler);
// Ruta para eliminar un pago específico por su ID
paymentsRouter.delete('/:id', deletePaymentHandler);
export default paymentsRouter;
