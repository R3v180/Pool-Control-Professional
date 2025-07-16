// filename: packages/server/src/api/visits/visits.service.ts
// version: 2.6.1 (FIX: Correct Prisma include statement)
// description: Se elimina la inclusión explícita del campo 'address' en la consulta de Prisma, ya que es un campo directo del modelo Pool y no una relación.

import { PrismaClient } from '@prisma/client';
import type { Visit } from '@prisma/client';
import { 
  startOfDay, endOfDay,
} from 'date-fns';

const prisma = new PrismaClient();

// --- Tipos ---
export type WorkOrderInput = {
  results: Record<string, string | number | boolean>;
  completedTasks: Record<string, boolean>;
  consumptions?: { productId: string; quantity: number }[];
  notes?: string;
  hasIncident?: boolean;
  imageUrls?: string[]; 
};
export type CreateSpecialVisitInput = {
  poolId: string;
  timestamp: Date;
  notes?: string;
  technicianId?: string | null;
}
export type RescheduleVisitInput = {
  timestamp: Date;
  technicianId: string | null;
}

// --- Funciones del Servicio ---

export const getScheduledVisitsForWeek = async (
  tenantId: string, 
  startDate: Date, 
  endDate: Date,
  technicianIds?: string[],
  zoneIds?: string[]
): Promise<Visit[]> => {
  
  const UNASSIGNED_FILTER_KEY = 'unassigned';
  let containsUnassignedFilter = false;
  let filteredTechnicianIds = technicianIds;

  if (technicianIds && technicianIds.includes(UNASSIGNED_FILTER_KEY)) {
    containsUnassignedFilter = true;
    filteredTechnicianIds = technicianIds.filter(id => id !== UNASSIGNED_FILTER_KEY);
  }

  const technicianWhereClause: any = {};
  if (containsUnassignedFilter && filteredTechnicianIds && filteredTechnicianIds.length > 0) {
    technicianWhereClause.OR = [
      { technicianId: { in: filteredTechnicianIds } },
      { technicianId: null }
    ];
  } else if (containsUnassignedFilter) {
    technicianWhereClause.technicianId = null;
  } else if (filteredTechnicianIds && filteredTechnicianIds.length > 0) {
    technicianWhereClause.technicianId = { in: filteredTechnicianIds };
  }

  return prisma.visit.findMany({
    where: { 
      pool: { 
        tenantId,
        zoneId: zoneIds && zoneIds.length > 0 ? { in: zoneIds } : undefined,
      }, 
      timestamp: { 
        gte: startDate, 
        lte: endDate 
      },
      ...technicianWhereClause
    },
    include: { 
      // ✅ CORRECCIÓN: Se elimina 'address: true' del 'include'
      pool: { include: { client: true, zone: true } },
      technician: { 
        select: { 
          id: true, 
          name: true, 
          isAvailable: true,
          availabilities: true,
        } 
      },
    },
    orderBy: { timestamp: 'asc' },
  });
};

// ... el resto del fichero no cambia ...

export const assignTechnicianToVisit = async (visitId: string, technicianId: string | null) => {
    return prisma.visit.update({
        where: { id: visitId },
        data: { technicianId },
    });
};

export const rescheduleVisit = async (visitId: string, data: RescheduleVisitInput) => {
  return prisma.visit.update({
    where: { id: visitId },
    data: {
      timestamp: data.timestamp,
      technicianId: data.technicianId,
    },
  });
};

export const getVisitsForTechnicianOnDate = async (
  technicianId: string,
  date: Date
): Promise<Visit[]> => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return prisma.visit.findMany({
    where: {
      technicianId,
      status: 'PENDING',
      timestamp: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: {
      pool: {
        include: {
          client: true,
        },
      },
      technician: { 
        select: { 
          id: true, 
          name: true, 
          isAvailable: true,
          availabilities: true,
        } 
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });
};

export const getVisitDetails = async (visitId: string) => {
  return prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      results: true, 
      notifications: {
        include: {
          images: true,
        }
      },
      consumptions: {
        include: {
          product: true,
        }
      },
      pool: {
        include: {
          client: true,
          configurations: {
            include: {
              parameterTemplate: true,
              taskTemplate: true,
            },
          },
        },
      },
      technician: true,
    },
  });
};

export const submitWorkOrder = async (visitId: string, data: WorkOrderInput) => {
  return prisma.$transaction(async (tx) => {
    const visit = await tx.visit.findUnique({
      where: { id: visitId },
      include: { 
        pool: { 
          include: { 
            configurations: { include: { parameterTemplate: true, taskTemplate: true } } 
          } 
        },
        technician: true
      },
    });
    if (!visit || !visit.technicianId) throw new Error('Visita o técnico no encontrados');
    
    const { results, completedTasks, notes, hasIncident, consumptions = [], imageUrls = [] } = data;

    if (consumptions && consumptions.length > 0) {
        const validConsumptions = consumptions
            .filter(c => c.productId && c.quantity && c.quantity > 0)
            .map(c => ({
                quantity: c.quantity,
                productId: c.productId,
                visitId: visitId,
            }));

        if (validConsumptions.length > 0) {
          await tx.consumption.createMany({
                data: validConsumptions,
            });
        }
    }

    const usersToNotify = await tx.user.findMany({
      where: {
        tenantId: visit.pool.tenantId,
        role: { in: ['ADMIN', 'MANAGER'] }
      },
      select: { id: true }
    });
    const notificationsToCreate: { message: string; tenantId: string; userId: string; visitId: string; priority: 'HIGH' }[] = [];
    for (const [configId, value] of Object.entries(results)) {
      if(value === '' || value === null || typeof value !== 'number') continue;
      const config = visit.pool.configurations.find(c => c.id === configId);
      if (config?.parameterTemplate) {
        await tx.visitResult.create({
          data: { visitId, value: String(value), parameterName: config.parameterTemplate.name, parameterUnit: config.parameterTemplate.unit, },
        });
        const { minThreshold, maxThreshold, parameterTemplate: { name: paramName, unit } } = config;
        let alertMessage = '';
        if (minThreshold !== null && value < minThreshold) {
            alertMessage = `Alerta en ${visit.pool.name}: ${paramName} está bajo (${value} ${unit || ''}). Límite inferior: ${minThreshold}.`;
        } else if (maxThreshold !== null && value > maxThreshold) {
            alertMessage = `Alerta en ${visit.pool.name}: ${paramName} está alto (${value} ${unit || ''}). Límite superior: ${maxThreshold}.`;
        }

        if (alertMessage) {
          for (const user of usersToNotify) {
            notificationsToCreate.push({
              message: alertMessage,
              tenantId: visit.pool.tenantId,
              userId: user.id,
              visitId: visit.id,
              priority: 'HIGH'
            });
          }
        }
      }
    }
    
    const completedTaskNames = Object.entries(completedTasks)
      .filter(([, completed]) => completed)
      .map(([configId]) => {
        const config = visit.pool.configurations.find(c => c.id === configId);
        return config?.taskTemplate?.name || 'Tarea desconocida';
      });
    await tx.visit.update({
      where: { id: visitId },
      data: { notes, hasIncident: hasIncident || false, completedTasks: completedTaskNames, status: 'COMPLETED', },
    });
    if (hasIncident && usersToNotify.length > 0) {
      const notificationMessage = notes && notes.trim().length > 0 
            ? notes 
            : `Incidencia reportada en ${visit.pool.name} por ${visit.technician?.name || 'un técnico'}`;

      for (const user of usersToNotify) {
        notificationsToCreate.push({
            message: notificationMessage,
            tenantId: visit.pool.tenantId,
            userId: user.id,
            visitId: visit.id,
            priority: 'HIGH'
        });
      }
    }
    
    if (notificationsToCreate.length > 0) {
      const uniqueNotifications = Array.from(new Map(notificationsToCreate.map(item => [item.message, item])).values());
      const mainNotification = uniqueNotifications.find(n => n.message.startsWith('Incidencia reportada'));
      let mainNotificationId: string | undefined;
      if(mainNotification) {
        const createdMainNotification = await tx.notification.create({ data: mainNotification });
        mainNotificationId = createdMainNotification.id;
      }
      
      const otherNotifications = uniqueNotifications.filter(n => !n.message.startsWith('Incidencia reportada'));
      if (otherNotifications.length > 0) {
          await tx.notification.createMany({ data: otherNotifications });
      }

      if (mainNotificationId && imageUrls.length > 0) {
        await tx.incidentImage.createMany({
          data: imageUrls.map(url => ({
            url: url,
            notificationId: mainNotificationId!,
            uploaderId: visit.technicianId!,
          })),
        });
      }
    }
    
    const configIdsToUpdate = [...Object.keys(results).filter(k => results[k] !== ''), ...Object.keys(completedTasks).filter(k => completedTasks[k])];
    if(configIdsToUpdate.length > 0) {
        await tx.poolConfiguration.updateMany({
            where: { id: { in: configIdsToUpdate } },
            data: { lastCompleted: new Date() },
        });
    }
  });
};

export const createSpecialVisit = async (data: CreateSpecialVisitInput): Promise<Visit> => {
  return prisma.visit.create({
    data: {
      poolId: data.poolId,
      timestamp: data.timestamp,
      technicianId: data.technicianId,
      notes: data.notes,
      status: 'PENDING',
    }
  });
};