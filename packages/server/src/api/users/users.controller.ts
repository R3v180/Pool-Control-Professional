// filename: packages/server/src/api/users/users.controller.ts
// version: 2.3.1 (Cleaned)

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { 
  getAssignableUsersByTenant, 
  updateUserAvailability,
  getAvailabilitiesForUser,
  setUserAvailability,
} from './users.service.js';

export const getAssignableUsersHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const assignableUsers = await getAssignableUsersByTenant(tenantId);
    res.status(200).json({ success: true, data: assignableUsers });
  } catch (error) {
    next(error);
  }
};

export const updateUserAvailabilityHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.params;
    const { isAvailable } = req.body;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
        return res.status(400).json({ success: false, message: 'Falta el ID de usuario o de tenant.' });
    }
    
    if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo isAvailable es requerido y debe ser un booleano.' });
    }

    const updatedUser = await updateUserAvailability(userId, tenantId, isAvailable);
    res.status(200).json({ success: true, data: updatedUser });

  } catch (error) {
    next(error);
  }
};

export const getUserAvailabilitiesHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.params;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(400).json({ success: false, message: 'Falta el ID de usuario o de tenant.' });
    }

    const availabilities = await getAvailabilitiesForUser(userId, tenantId);
    res.status(200).json({ success: true, data: availabilities });

  } catch (error) {
    next(error);
  }
};

export const setUserAvailabilityHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    const { userId, startDate, endDate, reason } = req.body;

    if (!userId || !tenantId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos (userId, tenantId, startDate, endDate).' });
    }
    
    const newAvailability = await setUserAvailability({ userId, tenantId, startDate, endDate, reason });
    res.status(201).json({ success: true, data: newAvailability });
  } catch (error) {
    next(error);
  }
};