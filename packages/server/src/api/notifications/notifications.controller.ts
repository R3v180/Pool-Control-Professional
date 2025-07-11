// filename: packages/server/src/api/notifications/notifications.controller.ts
// version: 1.5.0
// description: El manejador del historial ahora acepta y pasa filtros al servicio.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { 
  getNotificationsForUser, 
  markNotificationAsRead, 
  resolveNotification, 
  getNotificationHistory,
  classifyNotification
} from './notifications.service.js';
import { IncidentPriority, NotificationStatus } from '@prisma/client';

/**
 * Maneja la obtención de las notificaciones PENDIENTES para el usuario autenticado.
 */
export const getNotificationsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const notifications = await getNotificationsForUser(userId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención del HISTORIAL COMPLETO de notificaciones para el tenant, con paginación y filtros.
 */
export const getHistoryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ message: 'Usuario no autenticado o sin tenant.' });
    }

    // --- LÓGICA DE PAGINACIÓN Y FILTROS ---
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // Extraemos los filtros de la query string
    const status = req.query.status as NotificationStatus | undefined;
    const clientId = req.query.clientId as string | undefined;

    // Validamos que el status sea uno de los valores permitidos si se proporciona
    if (status && !Object.values(NotificationStatus).includes(status)) {
        return res.status(400).json({ message: 'El estado proporcionado no es válido.' });
    }

    const historyData = await getNotificationHistory(tenantId, page, pageSize, status, clientId);
    
    res.status(200).json({ success: true, data: historyData });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la acción de marcar una notificación como leída.
 */
export const markAsReadHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }
    if (!notificationId) {
      return res.status(400).json({ message: 'El ID de la notificación es requerido.' });
    }

    const updatedNotification = await markNotificationAsRead(notificationId, userId);
    res.status(200).json({ success: true, data: updatedNotification });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la acción de resolver una notificación.
 */
export const resolveNotificationHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;
    const { resolutionNotes } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }
    if (!notificationId) {
      return res.status(400).json({ message: 'El ID de la notificación es requerido.' });
    }
    if (typeof resolutionNotes !== 'string') {
      return res.status(400).json({ message: 'Se requieren notas de resolución.' });
    }

    const resolvedNotification = await resolveNotification(notificationId, userId, resolutionNotes);
    res.status(200).json({ success: true, data: resolvedNotification });

  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la acción de clasificar una notificación (establecer prioridad y plazo).
 */
export const classifyNotificationHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;
        const { priority, deadline } = req.body;

        if (!userId) {
          return res.status(401).json({ message: 'Usuario no autenticado.' });
        }
        if (!notificationId) {
          return res.status(400).json({ message: 'El ID de la notificación es requerido.' });
        }
        if (!priority || !Object.values(IncidentPriority).includes(priority)) {
            return res.status(400).json({ message: 'La prioridad proporcionada no es válida.' });
        }

        const deadlineDate = deadline ? new Date(deadline) : undefined;
        if (deadlineDate && isNaN(deadlineDate.getTime())) {
            return res.status(400).json({ message: 'El plazo proporcionado no es una fecha válida.'});
        }

        const classifiedNotification = await classifyNotification(notificationId, userId, priority, deadlineDate);
        res.status(200).json({ success: true, data: classifiedNotification });

    } catch (error) {
        next(error);
    }
};