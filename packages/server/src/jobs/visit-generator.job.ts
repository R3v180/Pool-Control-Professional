// filename: packages/server/src/jobs/visit-generator.job.ts
// version: 1.0.0
// description: Script para generar automáticamente las visitas de la semana basadas en las Rutas Maestras.

import { PrismaClient } from '@prisma/client';
import type { DayOfWeek } from '@prisma/client';
import {
  startOfWeek,
  addDays,
  getISOWeek,
  isWithinInterval,
  startOfDay,
} from 'date-fns';

const prisma = new PrismaClient();

const DAY_OF_WEEK_ORDER: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];

/**
 * Genera las visitas para una semana específica basándose en las Rutas Maestras.
 * @param targetDate - Una fecha dentro de la semana para la que se generarán las visitas.
 */
async function generateWeeklyVisits(targetDate: Date) {
  console.log('--- 🤖 Iniciando Job de Generación de Visitas ---');
  
  const startOfTargetWeek = startOfWeek(targetDate, { weekStartsOn: 1 });
  const targetWeekNumber = getISOWeek(startOfTargetWeek);
  
  console.log(`📅 Procesando semana del ${startOfTargetWeek.toLocaleDateString()} (Semana ISO: ${targetWeekNumber})`);

  const templates = await prisma.routeTemplate.findMany({
    include: {
      seasons: true,
      zones: { select: { id: true } },
      technician: { select: { id: true } },
    },
  });
  
  let totalVisitsCreated = 0;

  for (const template of templates) {
    // 1. Encontrar la temporada activa para la semana actual
    const activeSeason = template.seasons.find(season => 
      isWithinInterval(startOfTargetWeek, { start: season.startDate, end: season.endDate })
    );

    if (!activeSeason) {
      console.log(`- Ruta '${template.name}': Omitida (sin temporada activa para esta semana).`);
      continue;
    }

    // 2. Determinar si se debe crear una visita según la frecuencia
    let shouldCreateVisit = false;
    switch (activeSeason.frequency) {
      case 'WEEKLY':
        shouldCreateVisit = true;
        break;
      case 'BIWEEKLY': // Cada dos semanas (semanas pares del año)
        shouldCreateVisit = targetWeekNumber % 2 === 0;
        break;
      case 'MONTHLY': // La primera semana del mes
        shouldCreateVisit = startOfTargetWeek.getDate() <= 7;
        break;
      case 'QUARTERLY': // La primera semana del primer mes de cada trimestre
        const isFirstWeekOfMonth = startOfTargetWeek.getDate() <= 7;
        const isFirstMonthOfQuarter = [0, 3, 6, 9].includes(startOfTargetWeek.getMonth());
        shouldCreateVisit = isFirstWeekOfMonth && isFirstMonthOfQuarter;
        break;
    }

    if (!shouldCreateVisit) {
      console.log(`- Ruta '${template.name}': Omitida (frecuencia ${activeSeason.frequency} no aplica esta semana).`);
      continue;
    }
    
    // 3. Calcular la fecha exacta de la visita
    const dayIndex = DAY_OF_WEEK_ORDER.indexOf(template.dayOfWeek);
    if (dayIndex === -1) continue;
    
    const visitDate = startOfDay(addDays(startOfTargetWeek, dayIndex));

    // 4. Obtener todas las piscinas de las zonas de la ruta
    const zoneIds = template.zones.map(z => z.id);
    const poolsInRoute = await prisma.pool.findMany({
      where: { zoneId: { in: zoneIds } },
    });

    if (poolsInRoute.length === 0) continue;

    console.log(`- Ruta '${template.name}': Procesando ${poolsInRoute.length} piscinas para el ${visitDate.toLocaleDateString()}...`);

    // 5. Crear las visitas si no existen
    for (const pool of poolsInRoute) {
      const existingVisit = await prisma.visit.findFirst({
        where: {
          poolId: pool.id,
          timestamp: visitDate,
        },
      });

      if (existingVisit) {
        console.log(`  - Omitida: Visita para '${pool.name}' ya existe.`);
      } else {
        await prisma.visit.create({
          data: {
            poolId: pool.id,
            timestamp: visitDate,
            technicianId: template.technician?.id,
            status: 'PENDING',
          },
        });
        console.log(`  - ✅ Creada: Visita para '${pool.name}'.`);
        totalVisitsCreated++;
      }
    }
  }
  
  console.log(`\n--- ✨ Job Finalizado. Total de visitas nuevas creadas: ${totalVisitsCreated} ---`);
}

// --- Bloque de Ejecución ---
async function runJob() {
  try {
    // Se puede pasar una fecha específica para pruebas, ej: new Date('2025-07-21')
    await generateWeeklyVisits(new Date()); 
  } catch (e) {
    console.error('❌ Error fatal durante la ejecución del job:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runJob();