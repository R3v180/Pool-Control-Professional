// filename: packages/server/src/api/visits/visits.controller.ts
// Version: 1.8.0 (FEAT: Add handler for special visit creation)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { 
  getScheduledVisitsForWeek, 
  assignTechnicianToVisit,
  getVisitsForTechnicianOnDate,
  getVisitDetails,
  submitWorkOrder,
  createSpecialVisit, // Importamos la nueva función del servicio
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
    const { visitId, technicianId } = req.body;
    if (!visitId) {
      return res.status(400).json({ message: 'visitId es requerido.' });
    }
    
    const assignedVisit = await assignTechnicianToVisit(visitId, technicianId);
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
    
    const today = new Date();
    const visits = await getVisitsForTechnicianOnDate(technicianId, today);
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de los detalles de una visita específica.
 */
export const getVisitDetailsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la visita es requerido.' });
    }
    
    const visitDetails = await getVisitDetails(id);
    if (!visitDetails) {
      return res.status(404).json({ message: 'Visita no encontrada.' });
    }

    res.status(200).json({ success: true, data: visitDetails });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja el envío de un parte de trabajo.
 */
export const submitWorkOrderHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la visita es requerido.' });
    }
    
    await submitWorkOrder(id, req.body);
    res.status(200).json({ success: true, message: 'Parte de trabajo guardado con éxito.' });
  } catch (error) {
    console.error('ERROR AL PROCESAR PARTE DE TRABAJO:', error); 
    next(error);
  }
};

// ✅ --- FUNCIÓN AÑADIDA Y EXPORTADA ---
/**
 * Maneja la creación de una visita especial (Orden de Trabajo Especial).
 */
export const createSpecialVisitHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
    try {
        const { poolId, timestamp } = req.body;
        if (!poolId || !timestamp) {
            return res.status(400).json({ success: false, message: 'Los campos poolId y timestamp son obligatorios.' });
        }

        const newVisit = await createSpecialVisit(req.body);
        res.status(201).json({ success: true, data: newVisit });

    } catch (error) {
        next(error);
    }
};