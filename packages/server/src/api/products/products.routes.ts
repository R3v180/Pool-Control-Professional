// filename: packages/server/src/api/products/products.routes.ts
// version: 2.0.2 (FIX: Allow MANAGER to read product catalog)
// description: Se añade el rol MANAGER a la lista de autorización para leer el catálogo de productos. Esto es necesario para que puedan ver los detalles de los consumos en los partes de trabajo.

import { Router } from 'express';
import {
  createProductHandler,
  getProductsHandler,
  updateProductHandler,
  deleteProductHandler,
} from './products.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';

const productsRouter = Router();

// Aplicamos el middleware `protect` a todas las rutas.
productsRouter.use(protect);

// Definimos las rutas para el recurso /api/products
productsRouter.route('/')
  // ✅ CORRECCIÓN: Se añade el rol 'MANAGER' a la autorización de lectura.
  .get(authorize('ADMIN', 'TECHNICIAN', 'MANAGER'), getProductsHandler)
  // La creación sigue siendo solo para ADMIN.
  .post(authorize('ADMIN'), createProductHandler);

// Las operaciones de modificación y borrado siguen siendo solo para ADMIN.
productsRouter.route('/:id')
  .patch(authorize('ADMIN'), updateProductHandler)
  .delete(authorize('ADMIN'), deleteProductHandler);

export default productsRouter;