// filename: packages/server/src/api/notifications/notifications.service.ts
// version: 1.3.0
// description: Añade la lógica para obtener el historial completo de notificaciones.

import { PrismaClient } from '@prisma/client';
import type { Notification } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtiene todas las notificaciones con estado PENDING para un usuario específico.
 */
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: {
      userId,
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Obtiene el historial completo de notificaciones para un tenant, incluyendo las resueltas.
 * @param tenantId - El ID del tenant.
 * @returns Una promesa que resuelve en un array con todas las notificaciones.
 */
export const getNotificationHistory = async (tenantId: string): Promise<Notification[]> => {
    return prisma.notification.findMany({
        where: {
            tenantId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        // Incluimos datos relacionados para mostrar en la tabla del historial
        include: {
            visit: {
                include: {
                    pool: {
                        select: { name: true } // Solo necesitamos el nombre de la piscina
                    },
                    technician: {
                        select: { name: true } // Solo necesitamos el nombre del técnico
                    }
                }
            }
        }
    });
};

/**
 * Marca una notificación específica como leída.
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<Notification> => {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: userId, 
    },
    data: {
      isRead: true,
    },
  });
  
  return prisma.notification.findUniqueOrThrow({ where: { id: notificationId } });
};


/**
 * Resuelve una notificación, cambiando su estado y añadiendo notas de resolución.
 */
export const resolveNotification = async (
    notificationId: string,
    userId: string,
    resolutionNotes: string,
): Promise<Notification> => {
    return prisma.notification.update({
        where: {
            id: notificationId,
            userId: userId,
        },
        data: {
            status: 'RESOLVED',
            resolutionNotes: resolutionNotes,
        },
    });
};