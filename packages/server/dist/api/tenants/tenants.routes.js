// filename: packages/server/src/api/tenants/tenants.routes.ts
// version: 2.0.0 (FEAT: Protect routes with SUPER_ADMIN authorization)
import { Router } from 'express';
import { createTenantHandler, getAllTenantsHandler, getTenantByIdHandler, updateTenantStatusHandler, deleteTenantHandler, } from './tenants.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.middleware.js';
const tenantsRouter = Router();
// Aplicamos la protección en dos niveles a TODAS las rutas de este enrutador:
// 1. `protect`: Asegura que el usuario esté autenticado.
// 2. `authorize('SUPER_ADMIN')`: Asegura que el usuario autenticado tenga el rol de SUPER_ADMIN.
tenantsRouter.use(protect, authorize('SUPER_ADMIN'));
/**
 * @route   GET /api/tenants
 * @desc    Obtiene todos los tenants
 * @access  Private (SuperAdmin)
 */
tenantsRouter.get('/', getAllTenantsHandler);
/**
 * @route   POST /api/tenants
 * @desc    Crea un nuevo tenant y su primer usuario admin
 * @access  Private (SuperAdmin)
 */
tenantsRouter.post('/', createTenantHandler);
/**
 * @route   GET /api/tenants/:id
 * @desc    Obtiene un tenant específico por su ID
 * @access  Private (SuperAdmin)
 */
tenantsRouter.get('/:id', getTenantByIdHandler);
/**
 * @route   PATCH /api/tenants/:id/status
 * @desc    Actualiza el estado de la suscripción de un tenant
 * @access  Private (SuperAdmin)
 */
tenantsRouter.patch('/:id/status', updateTenantStatusHandler);
/**
 * @route   DELETE /api/tenants/:id
 * @desc    Elimina un tenant y toda su información asociada
 * @access  Private (SuperAdmin)
 */
tenantsRouter.delete('/:id', deleteTenantHandler);
export default tenantsRouter;
