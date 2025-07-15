// filename: packages/server/src/api/pools/pools.controller.ts
// Version: 2.0.0 (FEAT: Pass tenantId to service for validation)

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
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
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
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de piscina o de tenant faltante.' });
    }

    const updatedPool = await updatePool(id, tenantId, req.body);
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
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de piscina o de tenant faltante.' });
    }

    await deletePool(id, tenantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};