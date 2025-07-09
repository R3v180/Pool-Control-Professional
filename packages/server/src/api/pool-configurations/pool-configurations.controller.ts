// filename: packages/server/src/api/pool-configurations/pool-configurations.controller.ts
// Version: 1.1.0 (Add handler for update functionality)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createPoolConfiguration,
  deletePoolConfiguration,
  getConfigurationsByPool,
  updatePoolConfiguration,
} from './pool-configurations.service.js';

/**
 * Maneja la creación de una nueva configuración de mantenimiento.
 */
export const createPoolConfigurationHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }
    const newConfig = await createPoolConfiguration(req.body);
    res.status(201).json({ success: true, data: newConfig });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todas las configuraciones para una piscina.
 */
export const getConfigurationsByPoolHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { poolId } = req.params;
    if (!poolId) {
      return res.status(400).json({ message: 'El ID de la piscina es requerido.' });
    }
    const configs = await getConfigurationsByPool(poolId);
    res.status(200).json({ success: true, data: configs });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de una configuración de mantenimiento.
 */
export const updatePoolConfigurationHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la configuración es requerido.' });
    }
    // TODO: Verificar que la configuración que se quiere editar pertenece al tenant del usuario.
    const updatedConfig = await updatePoolConfiguration(id, req.body);
    res.status(200).json({ success: true, data: updatedConfig });
  } catch (error) {
    next(error);
  }
};


/**
 * Maneja la eliminación de una configuración de mantenimiento.
 */
export const deletePoolConfigurationHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la configuración es requerido.' });
    }
    await deletePoolConfiguration(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};