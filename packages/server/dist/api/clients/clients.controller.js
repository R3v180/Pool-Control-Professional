// filename: packages/server/src/api/clients/clients.controller.ts
// Version: 2.0.0 (FEAT: Pass tenantId to service for validation)
import { createClient, deleteClient, getClientById, getClientsByTenant, updateClient, } from './clients.service.js';
/**
 * Maneja la creación de un nuevo cliente.
 */
export const createClientHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const input = { ...req.body, tenantId };
        const newClient = await createClient(input);
        res.status(201).json({ success: true, data: newClient });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de todos los clientes de un tenant.
 */
export const getClientsByTenantHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const clients = await getClientsByTenant(tenantId);
        res.status(200).json({ success: true, data: clients });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de un cliente específico por ID.
 */
export const getClientByIdHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        const { id: clientId } = req.params;
        if (!tenantId || !clientId) {
            return res.status(400).json({ success: false, message: 'ID de cliente o de tenant faltante.' });
        }
        const client = await getClientById(clientId, tenantId);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
        }
        res.status(200).json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la actualización de un cliente.
 */
export const updateClientHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de cliente o de tenant faltante.' });
        }
        const updatedClient = await updateClient(id, tenantId, req.body);
        res.status(200).json({ success: true, data: updatedClient });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la eliminación de un cliente.
 */
export const deleteClientHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de cliente o de tenant faltante.' });
        }
        await deleteClient(id, tenantId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
