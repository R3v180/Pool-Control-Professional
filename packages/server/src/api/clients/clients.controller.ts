// filename: packages/server/src/api/clients/clients.controller.ts
// Version: 1.0.0 (Initial creation of the controller for Client management)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createClient,
  deleteClient,
  getClientById,
  getClientsByTenant,
  updateClient,
} from './clients.service.js';

/**
 * Maneja la creación de un nuevo cliente.
 */
export const createClientHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const input = { ...req.body, tenantId };
    const newClient = await createClient(input);
    res.status(201).json({ success: true, data: newClient });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todos los clientes de un tenant.
 */
export const getClientsByTenantHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const clients = await getClientsByTenant(tenantId);
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de un cliente específico por ID.
 */
export const getClientByIdHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id: clientId } = req.params;

    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }
    if (!clientId) {
      return res.status(400).json({ message: 'El ID del cliente es requerido.' });
    }

    const client = await getClientById(clientId, tenantId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};


/**
 * Maneja la actualización de un cliente.
 */
export const updateClientHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID del cliente es requerido.' });
    }
    // TODO: Verificar que el cliente que se quiere editar pertenece al tenant del usuario logueado.
    
    const updatedClient = await updateClient(id, req.body);
    res.status(200).json({ success: true, data: updatedClient });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de un cliente.
 */
export const deleteClientHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID del cliente es requerido.' });
    }
    // TODO: Verificar que el cliente que se quiere eliminar pertenece al tenant del usuario logueado.

    await deleteClient(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};