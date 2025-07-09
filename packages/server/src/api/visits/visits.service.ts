// filename: packages/server/src/api/visits/visits.service.ts
// Version: 1.0.2 (Remove unused Frequency import)
import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const prisma = new PrismaClient();

// --- Tipos de Entrada y Salida ---
interface ScheduledVisit {
  date: Date;
  poolId: string;
  poolName: string;
  clientName: string;
}

// --- Funciones del Servicio ---

/**
 * Calcula si una tarea/parámetro debe realizarse en un día específico.
 */
function shouldOccurOnDate(
  lastCompleted: Date | null,
): boolean {
  if (!lastCompleted) return true; 

  // TODO: Implementar lógica de frecuencia precisa (semanal, mensual, etc.)
  return true;
}

/**
 * Obtiene todas las visitas programadas para una semana específica para un tenant.
 * @param tenantId - El ID del tenant.
 * @param weekDate - Una fecha cualquiera dentro de la semana de interés.
 * @returns Un array de visitas programadas para esa semana.
 */
export const getScheduledVisitsForWeek = async (
  tenantId: string,
  weekDate: Date
): Promise<ScheduledVisit[]> => {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 }); // Lunes
  const end = endOfWeek(weekDate, { weekStartsOn: 1 }); // Domingo
  const weekDays = eachDayOfInterval({ start, end });

  const poolsWithConfigs = await prisma.pool.findMany({
    where: {
      tenantId,
      configurations: {
        some: {},
      },
    },
    include: {
      client: true,
      configurations: true,
    },
  });

  const scheduledVisits: ScheduledVisit[] = [];

  for (const day of weekDays) {
    for (const pool of poolsWithConfigs) {
      const shouldVisit = pool.configurations.some(config =>
        shouldOccurOnDate(config.lastCompleted)
      );
      
      if (shouldVisit) {
        const alreadyScheduled = scheduledVisits.some(
          v => v.poolId === pool.id && isSameDay(v.date, day)
        );

        if (!alreadyScheduled) {
          scheduledVisits.push({
            date: day,
            poolId: pool.id,
            poolName: pool.name,
            clientName: pool.client.name,
          });
        }
      }
    }
  }
  
  return scheduledVisits;
};