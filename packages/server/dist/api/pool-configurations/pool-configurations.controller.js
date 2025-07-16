// filename: packages/server/src/api/pool-configurations/pool-configurations.controller.ts
// Version: 2.0.0 (FEAT: Pass tenantId to service for validation)
import { createPoolConfiguration, deletePoolConfiguration, getConfigurationsByPool, updatePoolConfiguration, } from './pool-configurations.service.js';
/**
 * Maneja la creación de una nueva configuración de mantenimiento.
 */
export const createPoolConfigurationHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        // TODO: El servicio de creación aún necesita validación de tenantId.
        const newConfig = await createPoolConfiguration(req.body);
        res.status(201).json({ success: true, data: newConfig });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de todas las configuraciones para una piscina.
 */
export const getConfigurationsByPoolHandler = async (req, res, next) => {
    try {
        const { poolId } = req.params;
        if (!poolId) {
            return res.status(400).json({ success: false, message: 'El ID de la piscina es requerido.' });
        }
        // TODO: Validar que poolId pertenece al tenant del usuario.
        const configs = await getConfigurationsByPool(poolId);
        res.status(200).json({ success: true, data: configs });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la actualización de una configuración de mantenimiento.
 */
export const updatePoolConfigurationHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de configuración o de tenant faltante.' });
        }
        const updatedConfig = await updatePoolConfiguration(id, tenantId, req.body);
        res.status(200).json({ success: true, data: updatedConfig });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la eliminación de una configuración de mantenimiento.
 */
export const deletePoolConfigurationHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de configuración o de tenant faltante.' });
        }
        await deletePoolConfiguration(id, tenantId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
