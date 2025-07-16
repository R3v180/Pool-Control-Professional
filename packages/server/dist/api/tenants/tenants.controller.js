import { createTenant, getAllTenants, getTenantById, updateTenantStatus, deleteTenant, } from './tenants.service.js';
/**
 * Maneja la creación de un nuevo tenant.
 */
export const createTenantHandler = async (req, res, next) => {
    try {
        const tenant = await createTenant(req.body);
        res.status(201).json({ success: true, data: tenant });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de todos los tenants.
 */
export const getAllTenantsHandler = async (_req, res, next) => {
    try {
        const tenants = await getAllTenants();
        res.status(200).json({ success: true, data: tenants });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de un tenant por su ID.
 */
export const getTenantByIdHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID del tenant es requerido.' });
        }
        const tenant = await getTenantById(id);
        if (!tenant) {
            const error = new Error('Tenant no encontrado.');
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({ success: true, data: tenant });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la actualización del estado de un tenant.
 */
export const updateTenantStatusHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID del tenant es requerido.' });
        }
        const { status } = req.body;
        // TODO: Añadir validación para asegurar que 'status' es un valor válido del enum SubscriptionStatus
        const updatedTenant = await updateTenantStatus(id, status);
        res.status(200).json({ success: true, data: updatedTenant });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la eliminación de un tenant.
 */
export const deleteTenantHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID del tenant es requerido.' });
        }
        await deleteTenant(id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
