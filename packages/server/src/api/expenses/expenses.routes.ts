// filename: packages/server/src/api/expenses/expenses.routes.ts
// version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)

import { Router } from 'express';
import {
  createExpenseHandler,
  getExpensesByTenantHandler,
  deleteExpenseHandler,
} from './expenses.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const expensesRouter = Router();

// Protegemos todas las rutas de este módulo.
// Solo los usuarios autenticados con rol de ADMIN pueden gestionar los gastos.
expensesRouter.use(protect, authorize('ADMIN'));


// Rutas para /api/expenses
expensesRouter.route('/')
  .get(getExpensesByTenantHandler)
  .post(createExpenseHandler);

// Ruta para eliminar un gasto específico por su ID
expensesRouter.delete('/:id', deleteExpenseHandler);

export default expensesRouter;