// filename: packages/server/src/api/pools/pools.controller.ts
// Version: 1.0.0 (Initial creation of the controller for Pool management)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { createPool, deletePool, updatePool } from './pools.service.js';

/**
 * Maneja la creación de una nueva piscina.
 */
export const createPoolHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    // Aseguramos que la piscina se asigne al tenant del usuario.
    const input = { ...req.body, tenantId };
    const newPool = await createPool(input);
    res.status(201).json({ success: true, data: newPool });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de una piscina.
 */
export const updatePoolHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la piscina es requerido.' });
    }
    // TODO: Verificar que la piscina que se quiere editar pertenece al tenant del usuario logueado.

    const updatedPool = await updatePool(id, req.body);
    res.status(200).json({ success: true, data: updatedPool });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de una piscina.
 */
export const deletePoolHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la piscina es requerido.' });
    }
    // TODO: Verificar que la piscina que se quiere eliminar pertenece al tenant del usuario logueado.

    await deletePool(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};