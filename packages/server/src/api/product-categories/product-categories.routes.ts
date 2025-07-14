// filename: packages/server/src/api/product-categories/product-categories.routes.ts
// version: 1.0.0
// description: Define los endpoints de la API para el CRUD de categorías de productos.

import { Router } from 'express';
import {
  createProductCategoryHandler,
  getProductCategoriesHandler,
  updateProductCategoryHandler,
  deleteProductCategoryHandler,
} from './product-categories.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// TODO: Importar y usar un middleware de autorización para 'ADMIN'

const productCategoriesRouter = Router();

// Protegemos todas las rutas de este módulo. Solo usuarios autenticados podrán acceder.
productCategoriesRouter.use(protect);

// Rutas para /api/product-categories
productCategoriesRouter.route('/')
  .get(getProductCategoriesHandler)   // GET /api/product-categories
  .post(createProductCategoryHandler); // POST /api/product-categories

// Rutas para /api/product-categories/:id
productCategoriesRouter.route('/:id')
  .patch(updateProductCategoryHandler)  // PATCH /api/product-categories/:id
  .delete(deleteProductCategoryHandler); // DELETE /api/product-categories/:id

export default productCategoriesRouter;