// filename: packages/server/src/api/visits/visits.controller.ts
// Version: 1.0.0 (Initial creation of the controller for Visits)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getScheduledVisitsForWeek } from './visits.service.js';

/**
 * Maneja la obtención de las visitas programadas para una semana.
 */
export const getScheduledVisitsForWeekHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ message: 'Se requiere un parámetro de fecha válido.' });
    }

    const weekDate = new Date(date);
    const visits = await getScheduledVisitsForWeek(tenantId, weekDate);

    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    next(error);
  }
};