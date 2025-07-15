// ====== [69] packages/server/src/api/notifications/notifications.service.ts ======
// filename: packages/server/src/api/notifications/notifications.service.ts
// version: 1.7.1 (FIX: Remove unused import)
// description: Removed unused 'subHours' import from date-fns.

import { PrismaClient } from '@prisma/client';
import type { Notification, IncidentPriority, NotificationStatus } from '@prisma/client';
// ✅ CORRECCIÓN: Se elimina 'subHours' de la importación.
import { } from 'date-fns';

const prisma = new PrismaClient();

// --- Tipos ---
export type NotificationWithCriticality = Notification & { isCritical: boolean };

export type PaginatedNotifications = {
    notifications: (Notification & { visit: any })[];
    total: number;
};

/**
 * Obtiene todas las notificaciones con estado PENDING para un usuario específico.
 */
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: { userId, status: 'PENDING' },
    orderBy: { id: 'desc' },
  });
};

/**
 * Obtiene el historial de notificaciones para un tenant con filtros y paginación.
 */
export const getNotificationHistory = async (
  tenantId: string,
  page: number,
  pageSize: number,
  status?: NotificationStatus,
  clientId?: string
): Promise<PaginatedNotifications> => {
    
    const skip = (page - 1) * pageSize;

    const whereClause: any = { tenantId };
    if (status) {
        whereClause.status = status;
    }
    if (clientId) {
        whereClause.visit = { pool: { clientId: clientId } };
    }
    
    const [notifications, total] = await prisma.$transaction([
        prisma.notification.findMany({
            where: whereClause,
            skip: skip,
            take: pageSize,
            include: {
                visit: {
                    include: {
                        pool: {
                            include: { client: { select: { id: true, name: true } } }
                        },
                        technician: { select: { name: true } }
                    }
                },
                images: true,
            },
            orderBy: { id: 'desc' }
        }),
        prisma.notification.count({ where: whereClause })
    ]);
    
    const enrichedNotifications = notifications.map(notification => ({
        ...notification,
        isCritical: notification.status === 'PENDING' && (notification.priority === 'HIGH' || notification.priority === 'CRITICAL'),
    }));

    return { notifications: enrichedNotifications, total };
};


/**
 * Marca una notificación específica como leída.
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<Notification> => {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: userId },
    data: { isRead: true },
  });
  return prisma.notification.findUniqueOrThrow({ where: { id: notificationId } });
};


/**
 * Resuelve una notificación.
 */
export const resolveNotification = async (
    notificationId: string,
    userId: string,
    resolutionNotes: string,
): Promise<Notification> => {
    return prisma.notification.update({
        where: { id: notificationId, userId: userId },
        data: { status: 'RESOLVED', resolutionNotes: resolutionNotes },
    });
};

/**
 * Clasifica una notificación.
 */
export const classifyNotification = async (
    notificationId: string,
    userId: string,
    priority: IncidentPriority,
    deadline?: Date,
): Promise<Notification> => {
    return prisma.notification.update({
        where: { id: notificationId, userId: userId },
        data: { priority: priority, resolutionDeadline: deadline },
    });
};


/**
 * Obtiene los detalles de una única notificación por su ID.
 */
export const getNotificationById = async (notificationId: string) => {
  return prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      images: true,
      visit: {
        include: {
          pool: { select: { name: true } },
          technician: { select: { name: true } },
        },
      },
    },
  });
};