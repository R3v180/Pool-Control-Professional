// filename: packages/server/src/api/payments/payments.routes.ts
// version: 1.0.1 (FIXED)
// description: Define los endpoints de la API para el CRUD de pagos.

import { Router } from 'express';
import {
  createPaymentHandler,
  getPaymentsByClientHandler,
  deletePaymentHandler,
} from './payments.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// TODO: Importar y usar un middleware de autorización para 'ADMIN' o 'MANAGER'

const paymentsRouter = Router();

// Protegemos todas las rutas de este módulo.
paymentsRouter.use(protect);

// Ruta para crear un nuevo pago
paymentsRouter.post('/', createPaymentHandler);

// Ruta para obtener todos los pagos de un cliente específico
paymentsRouter.get('/by-client/:clientId', getPaymentsByClientHandler);

// Ruta para eliminar un pago específico por su ID
paymentsRouter.delete('/:id', deletePaymentHandler);

export default paymentsRouter;