// filename: packages/server/src/api/products/products.routes.ts
// version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)
import { Router } from 'express';
import { createProductHandler, getProductsHandler, updateProductHandler, deleteProductHandler, } from './products.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const productsRouter = Router();
// Aplicamos el middleware `protect` y `authorize` a todas las rutas de este enrutador.
// Solo los usuarios autenticados con rol de ADMIN podrán interactuar con el catálogo de productos.
productsRouter.use(protect, authorize('ADMIN'));
// Definimos las rutas para el recurso /api/products
productsRouter.route('/')
    .get(getProductsHandler) // GET /api/products -> Obtiene todos los productos
    .post(createProductHandler); // POST /api/products -> Crea un nuevo producto
// Definimos las rutas para un recurso específico /api/products/:id
productsRouter.route('/:id')
    .patch(updateProductHandler) // PATCH /api/products/:id -> Actualiza un producto
    .delete(deleteProductHandler); // DELETE /api/products/:id -> Elimina un producto
export default productsRouter;
