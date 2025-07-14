// filename: packages/server/src/api/client-product-pricing/client-product-pricing.routes.ts
// version: 1.0.0
// description: Define los endpoints de la API para el CRUD de reglas de precios.

import { Router } from 'express';
import {
  createPricingRuleHandler,
  getPricingRulesByClientHandler,
  updatePricingRuleHandler,
  deletePricingRuleHandler,
} from './client-product-pricing.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// TODO: Importar y usar un middleware de autorización para 'ADMIN'

const clientProductPricingRouter = Router();

// Protegemos todas las rutas de este módulo.
clientProductPricingRouter.use(protect);

// Ruta para crear una nueva regla
clientProductPricingRouter.post('/', createPricingRuleHandler);

// Ruta para obtener todas las reglas de un cliente específico
clientProductPricingRouter.get('/by-client/:clientId', getPricingRulesByClientHandler);

// Rutas para actualizar o eliminar una regla específica por su ID
clientProductPricingRouter.route('/:id')
  .patch(updatePricingRuleHandler)
  .delete(deletePricingRuleHandler);

export default clientProductPricingRouter;