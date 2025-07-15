// filename: packages/server/src/api/users/users.controller.ts
// Version: 2.1.3 (BULLETPROOF FIX)
// description: Restructures guards to be unmistakable for the TS compiler.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getAssignableUsersByTenant, updateUserAvailability } from './users.service.js';

/**
 * Maneja la obtención de todos los usuarios asignables (técnicos y gerentes) de un tenant.
 */
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

/**
 * Maneja la actualización del estado de disponibilidad de un usuario.
 */
export const updateUserAvailabilityHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.params;
    const { isAvailable } = req.body;
    const tenantId = req.user?.tenantId;

    // ✅ CORRECCIÓN A PRUEBA DE BALAS: Se valida cada variable requerida de forma individual y explícita.
    if (!userId || !tenantId) {
        return res.status(400).json({ success: false, message: 'Falta el ID de usuario o de tenant.' });
    }
    
    if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ success: false, message: 'El campo isAvailable es requerido y debe ser un booleano.' });
    }

    // En este punto, TypeScript sabe con 100% de certeza que userId y tenantId son strings.
    const updatedUser = await updateUserAvailability(userId, tenantId, isAvailable);
    res.status(200).json({ success: true, data: updatedUser });

  } catch (error) {
    next(error);
  }
};