// filename: packages/server/src/api/planning/planning.service.ts
// version: 1.0.0 (NEW)
// description: Servicio para obtener los datos agregados para el "Muelle de Carga".
import { PrismaClient } from '@prisma/client';
import { startOfToday, isWithinInterval } from 'date-fns';
const prisma = new PrismaClient();
export const getPendingWork = async (tenantId) => {
    const today = startOfToday();
    // 1. Obtener todas las visitas pendientes del tenant
    const pendingVisits = await prisma.visit.findMany({
        where: {
            pool: { tenantId },
            status: 'PENDING',
        },
        include: {
            pool: { select: { name: true, client: { select: { name: true } } } },
            technician: { include: { availabilities: true } },
        },
    });
    const overdueVisits = [];
    const orphanedVisits = [];
    for (const visit of pendingVisits) {
        const visitDate = new Date(visit.timestamp);
        // 2. Clasificar las visitas vencidas
        if (visitDate < today) {
            overdueVisits.push(visit);
            continue; // Una visita vencida ya no puede ser huérfana en el mismo ciclo
        }
        // 3. Clasificar las visitas huérfanas
        let isOrphaned = !visit.technician || !visit.technician.isAvailable;
        if (visit.technician && !isOrphaned) {
            const isUnavailable = visit.technician.availabilities.some(avail => isWithinInterval(visitDate, { start: new Date(avail.startDate), end: new Date(avail.endDate) }));
            if (isUnavailable)
                isOrphaned = true;
        }
        if (isOrphaned) {
            orphanedVisits.push(visit);
        }
    }
    return {
        overdueVisits,
        orphanedVisits,
        // Aquí iría la lógica para 'Incidencias por Asignar' en el futuro
    };
};
