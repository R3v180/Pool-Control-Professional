// filename: packages/server/src/api/client-product-pricing/client-product-pricing.routes.ts
// version: 2.0.0 (FEAT: Protect routes with ADMIN authorization)
import { Router } from 'express';
import { createPricingRuleHandler, getPricingRulesByClientHandler, updatePricingRuleHandler, deletePricingRuleHandler, } from './client-product-pricing.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const clientProductPricingRouter = Router();
// Protegemos todas las rutas de este módulo.
// Solo los usuarios autenticados con rol de ADMIN pueden gestionar las reglas de precios.
clientProductPricingRouter.use(protect, authorize('ADMIN'));
// Ruta para crear una nueva regla
clientProductPricingRouter.post('/', createPricingRuleHandler);
// Ruta para obtener todas las reglas de un cliente específico
clientProductPricingRouter.get('/by-client/:clientId', getPricingRulesByClientHandler);
// Rutas para actualizar o eliminar una regla específica por su ID
clientProductPricingRouter.route('/:id')
    .patch(updatePricingRuleHandler)
    .delete(deletePricingRuleHandler);
export default clientProductPricingRouter;
