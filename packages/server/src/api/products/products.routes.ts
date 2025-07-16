// filename: packages/server/src/api/products/products.routes.ts
// version: 2.0.1 (FIX: Allow TECHNICIAN to read product catalog)
// description: Se ajustan los permisos para permitir que el rol TECHNICIAN (y por extensión, un MANAGER actuando como tal) pueda leer la lista de productos. Esto es necesario para rellenar los partes de trabajo.

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
  // ✅ CORRECCIÓN: Se permite a ADMIN y TECHNICIAN leer la lista de productos.
  .get(authorize('ADMIN', 'TECHNICIAN'), getProductsHandler)
  // La creación sigue siendo solo para ADMIN.
  .post(authorize('ADMIN'), createProductHandler);

// Las operaciones de modificación y borrado siguen siendo solo para ADMIN.
productsRouter.route('/:id')
  .patch(authorize('ADMIN'), updateProductHandler)
  .delete(authorize('ADMIN'), deleteProductHandler);

export default productsRouter;