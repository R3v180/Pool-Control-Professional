// filename: packages/server/src/api/products/products.routes.ts
// version: 1.0.0
// description: Define los endpoints de la API para el catálogo de productos.

import { Router } from 'express';
import {
  createProductHandler,
  getProductsHandler,
  updateProductHandler,
  deleteProductHandler,
} from './products.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// TODO: Importar y usar un middleware de autorización para 'ADMIN'

const productsRouter = Router();

// Aplicamos el middleware 'protect' a todas las rutas de este enrutador.
// Solo los usuarios autenticados podrán interactuar con el catálogo de productos.
productsRouter.use(protect);

// Definimos las rutas para el recurso /api/products
productsRouter.route('/')
  .get(getProductsHandler)      // GET /api/products -> Obtiene todos los productos
  .post(createProductHandler);   // POST /api/products -> Crea un nuevo producto

// Definimos las rutas para un recurso específico /api/products/:id
productsRouter.route('/:id')
  .patch(updateProductHandler)  // PATCH /api/products/:id -> Actualiza un producto
  .delete(deleteProductHandler); // DELETE /api/products/:id -> Elimina un producto

export default productsRouter;