// filename: packages/server/src/api/product-categories/product-categories.routes.ts
// version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)
import { Router } from 'express';
import { createProductCategoryHandler, getProductCategoriesHandler, updateProductCategoryHandler, deleteProductCategoryHandler, } from './product-categories.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const productCategoriesRouter = Router();
// Protegemos todas las rutas de este módulo.
// Solo usuarios autenticados con rol de ADMIN podrán acceder.
productCategoriesRouter.use(protect, authorize('ADMIN'));
// Rutas para /api/product-categories
productCategoriesRouter.route('/')
    .get(getProductCategoriesHandler) // GET /api/product-categories
    .post(createProductCategoryHandler); // POST /api/product-categories
// Rutas para /api/product-categories/:id
productCategoriesRouter.route('/:id')
    .patch(updateProductCategoryHandler) // PATCH /api/product-categories/:id
    .delete(deleteProductCategoryHandler); // DELETE /api/product-categories/:id
export default productCategoriesRouter;
