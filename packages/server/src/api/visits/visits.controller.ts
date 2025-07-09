// filename: packages/server/src/api/visits/visits.controller.ts
// Version: 1.3.0 (Restore 'today' logic for getMyRouteHandler)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { 
  getScheduledVisitsForWeek, 
  assignTechnicianToVisit,
  getVisitsForTechnicianOnDate, // <-- Volvemos a usar esta
} from './visits.service.js';

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

/**
 * Maneja la asignación de un técnico a una visita.
 */
export const assignTechnicianHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const { poolId, technicianId, date } = req.body;
    if (!poolId || !date) {
      return res.status(400).json({ message: 'poolId y date son requeridos.' });
    }
    
    const visitDate = new Date(date);
    const assignedVisit = await assignTechnicianToVisit(poolId, technicianId, visitDate);
    
    res.status(200).json({ success: true, data: assignedVisit });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de la ruta diaria para el técnico autenticado.
 */
export const getMyRouteHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const technicianId = req.user?.id;
    if (!technicianId || req.user?.role !== 'TECHNICIAN') {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    
    // RESTAURAMOS LA LÓGICA ORIGINAL: filtramos por el día de hoy
    const today = new Date();
    const visits = await getVisitsForTechnicianOnDate(technicianId, today);
    
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    next(error);
  }
};