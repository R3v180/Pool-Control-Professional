// filename: packages/server/prisma/seed.ts
// version: 3.0.2
// description: Corrige la lógica de creación de la tercera incidencia en el seed, manteniendo la estructura completa.

import { PrismaClient } from '@prisma/client';
import type { Frequency, ParameterTemplate, ScheduledTaskTemplate, User, Pool } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';
import { subDays, addDays } from 'date-fns';

// --- Importación de los datos modulares ---
import { usersData } from './data/users.js';
import { parameterData, taskData } from './data/catalogs.js';
import { clientsData } from './data/clients.js';

const prisma = new PrismaClient();

// --- Funciones de ayuda ---
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  if (arr.length < count) {
    throw new Error(`No se pueden obtener ${count} elementos de un array con solo ${arr.length} elementos.`);
  }
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// --- Script Principal ---
async function main() {
  console.log('🌱 Empezando el proceso de seeding para la demo...');

  // 1. --- RESET COMPLETO DE LA BASE DE DATOS ---
  console.log('🗑️  Limpiando la base de datos...');
  await prisma.notification.deleteMany({});
  await prisma.visitResult.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.poolConfiguration.deleteMany({});
  await prisma.pool.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.scheduledTaskTemplate.deleteMany({});
  await prisma.parameterTemplate.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  console.log('✅ Base de datos reseteada.');

  // 2. --- CREACIÓN DE ENTIDADES DEL SISTEMA ---
  const systemTenant = await prisma.tenant.create({
    data: { companyName: 'SYSTEM_INTERNAL', subdomain: 'system', subscriptionStatus: 'ACTIVE' },
  });
  const superAdminPassword = await hashPassword('superadmin123');
  await prisma.user.create({
    data: { email: 'super@admin.com', name: 'Super Admin', password: superAdminPassword, role: 'SUPER_ADMIN', tenantId: systemTenant.id },
  });
  console.log('👑 SuperAdmin y Tenant del sistema creados.');

  // 3. --- CREACIÓN DEL TENANT DE PRUEBA Y USUARIOS ---
  const mainTenant = await prisma.tenant.create({
    data: { companyName: 'Piscival S.L.', subdomain: 'piscival', subscriptionStatus: 'ACTIVE' },
  });
  console.log(`\n🏢 Tenant de prueba creado: ${mainTenant.companyName}`);
  
  const createdUsers: User[] = [];
  for (const userData of usersData) {
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({ data: { ...userData, password: hashedPassword, tenantId: mainTenant.id } });
    createdUsers.push(user);
    console.log(`   👤 Usuario creado: ${userData.name} (${userData.role})`);
  }
  const adminUser = createdUsers.find(u => u.role === 'ADMIN');
  const technicians = createdUsers.filter(u => u.role === 'TECHNICIAN');
  if (!adminUser || technicians.length < 3) throw new Error('Seeding fallido: No se encontraron suficientes usuarios admin o técnicos.');

  // 4. --- CREACIÓN DE CATÁLOGOS ---
  const createdParams = await prisma.parameterTemplate.createManyAndReturn({ data: parameterData.map(p => ({ ...p, tenantId: mainTenant.id })) });
  console.log(`\n📊 Creados ${createdParams.length} parámetros en el catálogo.`);
  const createdTasks = await prisma.scheduledTaskTemplate.createManyAndReturn({ data: taskData.map(t => ({ ...t, tenantId: mainTenant.id })) });
  console.log(`📋 Creadas ${createdTasks.length} tareas en el catálogo.`);

  // 5. --- CREACIÓN DE CLIENTES Y PISCINAS ---
  const allPools: Pool[] = [];
  for (const data of clientsData) {
    const client = await prisma.client.create({ data: { ...data.client, tenantId: mainTenant.id } });
    console.log(`\n👨‍💼 Cliente creado: ${client.name}`);
    for (const poolData of data.pools) {
      const pool = await prisma.pool.create({ data: { ...poolData, clientId: client.id, tenantId: mainTenant.id } });
      allPools.push(pool);
      console.log(`   🏊 Piscina creada: ${pool.name}`);
      const configsToCreate = createPoolMaintenanceSheet(pool.id, createdParams, createdTasks, poolData.type);
      await prisma.poolConfiguration.createMany({ data: configsToCreate, skipDuplicates: true });
      console.log(`      📝 Ficha de mantenimiento creada para ${pool.name} con ${configsToCreate.length} ítems.`);
    }
  }
  if (allPools.length < 5) throw new Error('Seeding fallido: No se crearon suficientes piscinas.');

  // 6. --- SIMULACIÓN DE ACTIVIDAD RECIENTE ---
  console.log('\n⚙️  Simulando escenario de demo...');
  const today = new Date();
  const threeDaysAgo = subDays(today, 3);
  const tomorrow = addDays(today, 1);
  
  // --- Visitas PENDIENTES para hoy ---
  await prisma.visit.create({
    data: {
      timestamp: today,
      poolId: allPools[1]!.id,
      technicianId: technicians[0]!.id,
      status: 'PENDING',
    }
  });
  await prisma.visit.create({
    data: {
      timestamp: today,
      poolId: allPools[3]!.id,
      technicianId: technicians[1]!.id,
      status: 'PENDING',
    }
  });
  console.log('   - 2 visitas PENDIENTES para hoy creadas.');

  // --- Visita COMPLETADA SIN INCIDENCIA ---
  const okVisit = await prisma.visit.create({
    data: {
      timestamp: today,
      poolId: allPools[2]!.id,
      technicianId: technicians[1]!.id,
      status: 'COMPLETED',
      hasIncident: false,
      notes: 'Todo en orden. Valores perfectos. El cliente ha comentado que está muy contento con el servicio.',
      completedTasks: ['Limpieza de cestos de skimmers', 'Revisión de clorador salino']
    }
  });
  await prisma.visitResult.createMany({
    data: [
      { visitId: okVisit.id, parameterName: 'Nivel de pH', value: '7.4', parameterUnit: 'pH' },
      { visitId: okVisit.id, parameterName: 'Nivel de Sal (para piscinas de sal)', value: '4500', parameterUnit: 'ppm' }
    ]
  });
  console.log('   - 1 visita COMPLETADA OK creada.');
  
  // --- INCIDENCIA 1: CRÍTICA (Antigua) ---
  const criticalVisitNotes = 'Fuga de agua detectada en la tubería principal del skimmer. Gotea constantemente, el nivel de la piscina ha bajado notablemente.';
  const criticalVisit = await prisma.visit.create({
    data: {
      timestamp: threeDaysAgo,
      poolId: allPools[0]!.id,
      technicianId: technicians[0]!.id,
      status: 'COMPLETED',
      hasIncident: true,
      notes: criticalVisitNotes,
      completedTasks: ['Limpieza de cestos de skimmers']
    }
  });
  await prisma.visitResult.createMany({
    data: [
      { visitId: criticalVisit.id, parameterName: 'Nivel del Agua en Skimmer', value: 'Bajo' },
      { visitId: criticalVisit.id, parameterName: 'Nivel de pH', value: '7.9' },
    ]
  });
  await prisma.notification.create({
    data: {
      message: criticalVisitNotes,
      visitId: criticalVisit.id,
      tenantId: mainTenant.id,
      userId: adminUser.id,
      createdAt: threeDaysAgo,
    }
  });
  console.log('   - 1 incidencia CRÍTICA (de hace 3 días) creada.');

  // --- INCIDENCIA 2: PENDIENTE NORMAL ---
  // Este era el bloque que estaba fallando
  const pendingVisitNotes = 'El nivel de sal es bajo, pero no hay producto en el almacén. Avisar para reponer.';
  const pendingVisit = await prisma.visit.create({
    data: {
      timestamp: today,
      poolId: allPools[1]!.id, // Usamos una piscina diferente para más realismo
      technicianId: technicians[1]!.id, // Ana Técnica
      status: 'COMPLETED',
      hasIncident: true, // <-- LA LÍNEA QUE FALTABA
      notes: pendingVisitNotes,
      completedTasks: ['Limpieza de cestos de skimmers']
    }
  });
  await prisma.visitResult.createMany({
      data: [{ visitId: pendingVisit.id, parameterName: 'Nivel de Sal (para piscinas de sal)', value: '3800', parameterUnit: 'ppm' }]
  });
  await prisma.notification.create({
    data: {
      message: pendingVisitNotes,
      visitId: pendingVisit.id,
      tenantId: mainTenant.id,
      userId: adminUser.id,
    }
  });
  console.log('   - 1 incidencia PENDIENTE (de hoy) creada.');


  // --- INCIDENCIA 3: CLASIFICADA (Prioridad Alta) ---
  const classifiedVisitNotes = 'La bomba de calor hace un ruido metálico muy fuerte al arrancar. Podría romperse. Recomiendo no encenderla hasta que se revise.';
  const classifiedVisit = await prisma.visit.create({
    data: {
      timestamp: today,
      poolId: allPools[4]!.id,
      technicianId: technicians[2]!.id,
      status: 'COMPLETED',
      hasIncident: true,
      notes: classifiedVisitNotes,
      completedTasks: ['Limpieza de cestos de skimmers', 'Cepillado de paredes y línea de flotación']
    }
  });
  await prisma.visitResult.createMany({
    data: [
      { visitId: classifiedVisit.id, parameterName: 'Temperatura del Agua', value: '24', parameterUnit: '°C' },
      { visitId: classifiedVisit.id, parameterName: 'Presión del Filtro', value: '1.5', parameterUnit: 'bar' },
    ]
  });
  await prisma.notification.create({
    data: {
      message: classifiedVisitNotes,
      visitId: classifiedVisit.id,
      tenantId: mainTenant.id,
      userId: adminUser.id,
      priority: 'HIGH', 
      resolutionDeadline: tomorrow,
    }
  });
  console.log('   - 1 incidencia PENDIENTE CLASIFICADA (Prioridad ALTA) creada.');


  console.log('\n\n✅ Seeding de demostración completado con éxito!');
  console.log('--- Credenciales de prueba ---');
  console.log('SuperAdmin: super@admin.com / superadmin123');
  console.log('Admin:      admin@piscival.com / password123');
  console.log('Técnicos:   carlos.t@piscival.com, ana.t@piscival.com, leo.a@piscival.com (pass: password123)');
  console.log('Manager:    manager@piscival.com / password123');
}

/**
 * Función de lógica de negocio para generar una ficha de mantenimiento realista
 * para una piscina, basada en su tipo y en los catálogos disponibles.
 */
function createPoolMaintenanceSheet(
  poolId: string,
  allParams: ParameterTemplate[],
  allTasks: ScheduledTaskTemplate[],
  poolType: string | null
): any[] {
  const configs: any[] = [];

  const commonParams = allParams.filter(p => ['Nivel de pH', 'Alcalinidad Total (TA)', 'Estado del Agua'].includes(p.name));
  for (const param of commonParams) {
    configs.push({
      poolId,
      parameterTemplateId: param.id,
      frequency: 'SEMANAL' as Frequency,
      minThreshold: param.name.includes('pH') ? 7.2 : null,
      maxThreshold: param.name.includes('pH') ? 7.6 : null,
    });
  }

  const commonTasks = allTasks.filter(t => ['Limpieza de cestos de skimmers', 'Cepillado de paredes y línea de flotación'].includes(t.name));
  for (const task of commonTasks) {
    configs.push({ poolId, taskTemplateId: task.id, frequency: 'SEMANAL' as Frequency });
  }

  const backwashTask = allTasks.find(t => t.name.includes('Contralavado'));
  if (backwashTask) {
    configs.push({ poolId, taskTemplateId: backwashTask.id, frequency: 'QUINCENAL' as Frequency });
  }

  if (poolType === 'Cloro') {
    const cloroParams = allParams.filter(p => p.name.includes('Cloro Libre') || p.name.includes('Cloro Total'));
    for (const param of cloroParams) {
      configs.push({ poolId, parameterTemplateId: param.id, frequency: 'SEMANAL' as Frequency });
    }
  } else if (poolType === 'Sal') {
    const salParam = allParams.find(p => p.name.includes('Nivel de Sal'));
    const salTask = allTasks.find(t => t.name.includes('Revisión de clorador salino'));
    if (salParam) {
      configs.push({ poolId, parameterTemplateId: salParam.id, frequency: 'MENSUAL' as Frequency });
    }
    if (salTask) {
      configs.push({ poolId, taskTemplateId: salTask.id, frequency: 'QUINCENAL' as Frequency });
    }
  }
  
  const availableExtraParams = allParams.filter(p => !configs.some(c => c.parameterTemplateId === p.id));
  if (availableExtraParams.length >= 2) {
    const extraParams = getRandomItems(availableExtraParams, 2);
    for (const param of extraParams) {
      configs.push({ poolId, parameterTemplateId: param.id, frequency: 'MENSUAL' as Frequency });
    }
  }

  return configs;
}

// --- Ejecución ---
main()
  .catch((e) => {
    console.error('❌ Error fatal durante el proceso de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });