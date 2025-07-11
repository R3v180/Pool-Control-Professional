// filename: packages/server/src/api/notifications/notifications.routes.ts
// version: 1.3.0
// description: Añade el endpoint para clasificar una notificación.

import { Router } from 'express';
import { 
  getNotificationsHandler, 
  markAsReadHandler, 
  resolveNotificationHandler,
  getHistoryHandler,
  classifyNotificationHandler, // <-- Importar el nuevo manejador
} from './notifications.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const notificationsRouter = Router();

// --- Middleware de Protección ---
notificationsRouter.use(protect);

/**
 * @route   GET /api/notifications/history
 * @desc    Obtiene el historial completo de notificaciones del tenant.
 * @access  Private (Admin)
 */
notificationsRouter.get('/history', getHistoryHandler);

/**
 * @route   GET /api/notifications
 * @desc    Obtiene todas las notificaciones PENDIENTES para el usuario autenticado.
 * @access  Private
 */
notificationsRouter.get('/', getNotificationsHandler);

/**
 * @route   POST /api/notifications/:notificationId/read
 * @desc    Marca una notificación específica como leída.
 * @access  Private
 */
notificationsRouter.post('/:notificationId/read', markAsReadHandler);

/**
 * @route   POST /api/notifications/:notificationId/resolve
 * @desc    Resuelve una notificación, cambiando su estado y añadiendo notas.
 * @access  Private (Admin)
 */
notificationsRouter.post('/:notificationId/resolve', resolveNotificationHandler);

/**
 * @route   PATCH /api/notifications/:notificationId/classify
 * @desc    Clasifica una notificación (establece prioridad y/o plazo).
 * @access  Private (Admin)
 */
notificationsRouter.patch('/:notificationId/classify', classifyNotificationHandler);


export default notificationsRouter;