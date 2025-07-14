// filename: packages/server/src/api/expenses/expenses.routes.ts
// version: 1.0.0
// description: Define los endpoints de la API para el CRUD de gastos.

import { Router } from 'express';
import {
  createExpenseHandler,
  getExpensesByTenantHandler,
  deleteExpenseHandler,
} from './expenses.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// TODO: Importar y usar un middleware de autorización para 'ADMIN' o 'MANAGER'

const expensesRouter = Router();

// Protegemos todas las rutas de este módulo.
expensesRouter.use(protect);

// Rutas para /api/expenses
expensesRouter.route('/')
  .get(getExpensesByTenantHandler)
  .post(createExpenseHandler);

// Ruta para eliminar un gasto específico por su ID
expensesRouter.delete('/:id', deleteExpenseHandler);

export default expensesRouter;