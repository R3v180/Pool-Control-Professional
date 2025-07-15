// ====== [100] packages/server/src/api/users/users.controller.ts ======
// filename: packages/server/src/api/users/users.controller.ts
// Version: 2.0.0 (FEAT: Adapt controller to fetch assignable users)
// description: The controller now calls the service function that fetches both technicians and managers.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getAssignableUsersByTenant } from './users.service.js';

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