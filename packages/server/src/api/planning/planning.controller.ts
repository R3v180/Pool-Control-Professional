// filename: packages/server/src/api/planning/planning.controller.ts
// version: 1.0.0 (NEW)
// description: Controlador para el recurso de planificación agregada.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getPendingWork } from './planning.service.js';

/**
 * Maneja la obtención de todos los datos para el "Muelle de Carga".
 */
export const getPendingWorkHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida. Tenant no identificado.' });
    }

    const pendingWorkData = await getPendingWork(tenantId);
    res.status(200).json({ success: true, data: pendingWorkData });
  } catch (error) {
    next(error);
  }
};