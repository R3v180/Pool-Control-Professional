// filename: packages/server/src/api/visits/visits.service.ts
// Version: 1.3.0 (Remove temporary getAllVisitsForTechnician function)
import { PrismaClient } from '@prisma/client';
import type { Frequency, Visit } from '@prisma/client';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

// --- Tipos ---
interface ScheduledVisit {
  id: string; 
  date: Date;
  poolId: string;
  poolName: string;
  clientName: string;
  technicianId: string | null;
}

// --- Lógica de Frecuencia ---
function shouldOccurOnDate(
  frequency: Frequency,
  lastCompleted: Date | null,
  targetDate: Date,
  weekStart: Date
): boolean {
  if (!lastCompleted) return true;
  switch (frequency) {
    case 'DIARIA':
      return true;
    case 'SEMANAL':
      return targetDate.getDay() === weekStart.getDay();
    default:
      return targetDate.getDay() === weekStart.getDay();
  }
}

// --- Funciones del Servicio ---
export const getScheduledVisitsForWeek = async (
  tenantId: string,
  weekDate: Date
): Promise<ScheduledVisit[]> => {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 });
  const end = endOfWeek(weekDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const [poolsWithConfigs, existingVisits] = await Promise.all([
    prisma.pool.findMany({
      where: { tenantId, configurations: { some: {} } },
      include: { client: true, configurations: true },
    }),
    prisma.visit.findMany({
      where: {
        pool: { tenantId },
        timestamp: { gte: start, lte: end },
      },
    }),
  ]);

  const scheduledVisitsMap = new Map<string, ScheduledVisit>();

  for (const day of weekDays) {
    for (const pool of poolsWithConfigs) {
      const shouldVisit = pool.configurations.some(config =>
        shouldOccurOnDate(config.frequency, config.lastCompleted, day, start)
      );
      
      if (shouldVisit) {
        const visitKey = `${pool.id}-${day.toISOString().split('T')[0]}`;
        
        if (!scheduledVisitsMap.has(visitKey)) {
          const existingVisit = existingVisits.find(
            v => v.poolId === pool.id && isSameDay(v.timestamp, day)
          );

          scheduledVisitsMap.set(visitKey, {
            id: existingVisit ? existingVisit.id : visitKey,
            date: day,
            poolId: pool.id,
            poolName: pool.name,
            clientName: pool.client.name,
            technicianId: existingVisit ? existingVisit.technicianId : null,
          });
        }
      }
    }
  }
  
  return Array.from(scheduledVisitsMap.values());
};

export const assignTechnicianToVisit = async (
  poolId: string,
  technicianId: string | null,
  date: Date
) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const visit = await prisma.visit.findFirst({
    where: {
      poolId,
      timestamp: { gte: dayStart, lt: dayEnd }
    }
  });

  if (visit) {
    return prisma.visit.update({
      where: { id: visit.id },
      data: { technicianId },
    });
  } else {
    return prisma.visit.create({
      data: {
        poolId,
        technicianId,
        timestamp: date,
      },
    });
  }
};

/**
 * Obtiene las visitas asignadas a un técnico en una fecha específica.
 * @param technicianId - El ID del técnico.
 * @param date - La fecha de interés.
 * @returns Un array de visitas.
 */
export const getVisitsForTechnicianOnDate = async (
  technicianId: string,
  date: Date
): Promise<Visit[]> => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return prisma.visit.findMany({
    where: {
      technicianId,
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