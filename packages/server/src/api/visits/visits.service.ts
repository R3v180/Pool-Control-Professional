// filename: packages/server/src/api/visits/visits.service.ts
// version: 1.8.3 (Use technician's notes for incident notification message)
import { PrismaClient } from '@prisma/client';
import type { Visit } from '@prisma/client';
import { 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfDay, endOfDay,
} from 'date-fns';

const prisma = new PrismaClient();

// --- Tipos ---
export type WorkOrderInput = {
  results: Record<string, string | number | boolean>;
  completedTasks: Record<string, boolean>;
  notes?: string;
  hasIncident?: boolean;
};


export const getScheduledVisitsForWeek = async (tenantId: string, weekDate: Date): Promise<Visit[]> => {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 });
  const end = endOfWeek(weekDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const pools = await prisma.pool.findMany({
    where: { tenantId, configurations: { some: {} } },
    include: { configurations: true },
  });

  const existingVisits = await prisma.visit.findMany({
    where: { pool: { tenantId }, timestamp: { gte: start, lte: end } },
  });

  const visitsToCreate: { poolId: string; timestamp: Date }[] = [];

  for (const day of weekDays) {
    for (const pool of pools) {
      
      const shouldVisitToday = pool.configurations.some(config => {
        if (config.frequency === 'DIARIA') return true;
        if (config.frequency === 'SEMANAL' && day.getDay() === 1) return true;
        return false;
      });

      if (shouldVisitToday) {
        const alreadyExists = existingVisits.some(
          (v) => v.poolId === pool.id && isSameDay(v.timestamp, day)
        );
        const alreadyInQueue = visitsToCreate.some(
          (v) => v.poolId === pool.id && isSameDay(v.timestamp, day)
        );

        if (!alreadyExists && !alreadyInQueue) {
          visitsToCreate.push({ poolId: pool.id, timestamp: day });
        }
      }
    }
  }

  if (visitsToCreate.length > 0) {
    await prisma.visit.createMany({
      data: visitsToCreate.map(v => ({ ...v, status: 'PENDING' })),
      skipDuplicates: true,
    });
  }

  return prisma.visit.findMany({
    where: { pool: { tenantId }, timestamp: { gte: start, lte: end } },
    include: { 
      pool: { include: { client: true } },
      technician: { select: { name: true } },
    },
    orderBy: { timestamp: 'asc' },
  });
};

export const assignTechnicianToVisit = async (visitId: string, technicianId: string | null) => {
    return prisma.visit.update({
        where: { id: visitId },
        data: { technicianId },
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
      notifications: true,
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
    if (!visit) throw new Error('Visita no encontrada');
    
    const { results, completedTasks, notes, hasIncident } = data;

    for (const [configId, value] of Object.entries(results)) {
      if(value === '' || value === null) continue;
      const config = visit.pool.configurations.find(c => c.id === configId);
      if (config?.parameterTemplate) {
        await tx.visitResult.create({
          data: {
            visitId,
            value: String(value),
            parameterName: config.parameterTemplate.name,
            parameterUnit: config.parameterTemplate.unit,
          },
        });
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
      data: {
        notes,
        hasIncident: hasIncident || false,
        completedTasks: completedTaskNames,
        status: 'COMPLETED',
      },
    });

    if (hasIncident) {
      const admin = await tx.user.findFirst({
        where: { tenantId: visit.pool.tenantId, role: 'ADMIN' },
      });
      if (admin) {
        // --- CORRECCIÓN AQUÍ ---
        // El mensaje de la notificación ahora son las notas del técnico.
        // Si no hay notas, se usa un mensaje genérico.
        const notificationMessage = notes && notes.trim().length > 0 
            ? notes 
            : `Incidencia reportada en ${visit.pool.name}`;

        await tx.notification.create({
          data: {
            message: notificationMessage,
            tenantId: visit.pool.tenantId,
            userId: admin.id,
            visitId: visit.id,
            status: 'PENDING',
          },
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