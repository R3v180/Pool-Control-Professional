// filename: packages/server/src/api/notifications/notifications.service.ts
// version: 1.6.1 (FIXED - Based on v1.5.1, adds getNotificationById)

import { PrismaClient } from '@prisma/client';
import type { Notification, IncidentPriority, NotificationStatus } from '@prisma/client';
import { subHours } from 'date-fns';

const prisma = new PrismaClient();

// --- Tipos ---
export type NotificationWithCriticality = Notification & { isCritical: boolean };

export type PaginatedNotifications = {
    notifications: (Notification & { visit: any })[]; // Ajustado para que coincida con el include
    total: number;
};

/**
 * Obtiene todas las notificaciones con estado PENDING para un usuario específico.
 */
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: { userId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
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
                images: true, // Incluimos las imágenes
            }
        }),
        prisma.notification.count({ where: whereClause })
    ]);
    
    const now = new Date();
    const criticalThreshold = subHours(now, 48); 

    const enrichedAndSortedNotifications = notifications
        .map(notification => {
            const isOverdueByDeadline = notification.resolutionDeadline && notification.resolutionDeadline < now;
            const isOverdueByDefault = !notification.resolutionDeadline && notification.createdAt < criticalThreshold;
            return {
                ...notification,
                isCritical: (isOverdueByDeadline || isOverdueByDefault) && notification.status === 'PENDING',
            };
        })
        .sort((a, b) => {
            if (a.isCritical && !b.isCritical) return -1;
            if (!a.isCritical && b.isCritical) return 1;
            if (a.status === 'PENDING' && b.status === 'RESOLVED') return -1;
            if (a.status === 'RESOLVED' && b.status === 'PENDING') return 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

    return { notifications: enrichedAndSortedNotifications, total };
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
 * --- NUEVA FUNCIÓN ---
 * Obtiene los detalles de una única notificación por su ID.
 * @param notificationId - El ID de la notificación a buscar.
 * @returns El objeto de la notificación con sus relaciones, o null si no se encuentra.
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