// filename: packages/server/src/api/users/users.controller.ts
// Version: 1.0.0 (Initial creation of the controller for User queries)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getTechniciansByTenant } from './users.service.js';

/**
 * Maneja la obtención de todos los técnicos de un tenant.
 */
export const getTechniciansByTenantHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const technicians = await getTechniciansByTenant(tenantId);
    res.status(200).json({ success: true, data: technicians });
  } catch (error) {
    next(error);
  }
};