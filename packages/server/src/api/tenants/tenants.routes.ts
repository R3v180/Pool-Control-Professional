import { Router } from 'express';
import {
  createTenantHandler,
  getAllTenantsHandler,
  getTenantByIdHandler,
  updateTenantStatusHandler,
  deleteTenantHandler,
} from './tenants.controller.js';

const tenantsRouter = Router();

// TODO: Proteger todas estas rutas para que solo sean accesibles por un SUPER_ADMIN.

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