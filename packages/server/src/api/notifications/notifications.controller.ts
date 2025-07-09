// filename: packages/server/src/api/notifications/notifications.controller.ts
// version: 1.2.0
// description: Añade el manejador para obtener el historial de notificaciones.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getNotificationsForUser, markNotificationAsRead, resolveNotification, getNotificationHistory } from './notifications.service.js';

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
 * Maneja la obtención del HISTORIAL COMPLETO de notificaciones para el tenant.
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

    const history = await getNotificationHistory(tenantId);
    res.status(200).json({ success: true, data: history });
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