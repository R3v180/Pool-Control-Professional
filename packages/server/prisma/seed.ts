// filename: packages/server/prisma/seed.ts
// version: 3.5.0 (FEAT: Add rich consumption seed data)
// description: Versión que añade datos de consumo adicionales para probar los informes.

import { PrismaClient } from '@prisma/client';
import type { Frequency, ParameterTemplate, ScheduledTaskTemplate, User, Pool, Product } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';
import { subDays, addDays } from 'date-fns';

// --- Importación de los datos modulares ---
import { usersData } from './data/users.js';
import { parameterData, taskData } from './data/catalogs.js';
import { clientsData } from './data/clients.js';
import { productData } from './data/products.js';
import { incidentTasksData } from './data/incident-tasks.js';
// ✅ 1. IMPORTAR LOS NUEVOS DATOS DE CONSUMO
import { consumptionsData } from './data/consumptions.js';

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

  // La limpieza de la base de datos la realiza el comando `prisma migrate reset`.
  // No es necesario (y es problemático) hacerlo aquí de nuevo.

  // 1. --- CREACIÓN DE ENTIDADES DEL SISTEMA ---
  const systemTenant = await prisma.tenant.create({
    data: { companyName: 'SYSTEM_INTERNAL', subdomain: 'system', subscriptionStatus: 'ACTIVE' },
  });
  const superAdminPassword = await hashPassword('superadmin123');
  await prisma.user.create({
    data: { email: 'super@admin.com', name: 'Super Admin', password: superAdminPassword, role: 'SUPER_ADMIN', tenantId: systemTenant.id },
  });
  console.log('👑 SuperAdmin y Tenant del sistema creados.');

  // 2. --- CREACIÓN DEL TENANT DE PRUEBA Y USUARIOS ---
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

  // 3. --- CREACIÓN DE CATÁLOGOS ---
  const createdParams = await prisma.parameterTemplate.createManyAndReturn({ data: parameterData.map(p => ({ ...p, tenantId: mainTenant.id })) });
  console.log(`\n📊 Creados ${createdParams.length} parámetros en el catálogo de Parámetros.`);
  const createdTasks = await prisma.scheduledTaskTemplate.createManyAndReturn({ data: taskData.map(t => ({ ...t, tenantId: mainTenant.id })) });
  console.log(`📋 Creadas ${createdTasks.length} tareas en el catálogo de Tareas.`);
  
  const createdProducts: Product[] = [];
  for (const prodData of productData) {
      const product = await prisma.product.create({ data: { ...prodData, tenantId: mainTenant.id }});
      createdProducts.push(product);
  }
  console.log(`📦 Creados ${createdProducts.length} productos en el catálogo de Productos.`);

  // 4. --- CREACIÓN DE CLIENTES Y PISCINAS ---
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

  // 5. --- SIMULACIÓN DE ACTIVIDAD RECIENTE ---
  console.log('\n⚙️  Simulando escenario de demo...');
  const today = new Date();
  const threeDaysAgo = subDays(today, 3);
  const tomorrow = addDays(today, 1);
  
  await prisma.visit.create({ data: { timestamp: today, poolId: allPools[1]!.id, technicianId: technicians[0]!.id, status: 'PENDING' } });
  await prisma.visit.create({ data: { timestamp: today, poolId: allPools[3]!.id, technicianId: technicians[1]!.id, status: 'PENDING' } });
  console.log('   - 2 visitas PENDIENTES para hoy creadas.');

  const okVisit = await prisma.visit.create({ data: { timestamp: today, poolId: allPools[2]!.id, technicianId: technicians[1]!.id, status: 'COMPLETED', hasIncident: false, notes: 'Todo en orden. Valores perfectos. El cliente ha comentado que está muy contento con el servicio.', completedTasks: ['Limpieza de cestos de skimmers', 'Revisión de clorador salino'] } });
  await prisma.visitResult.createMany({ data: [ { visitId: okVisit.id, parameterName: 'Nivel de pH', value: '7.4', parameterUnit: 'pH' }, { visitId: okVisit.id, parameterName: 'Nivel de Sal (para piscinas de sal)', value: '4500', parameterUnit: 'ppm' } ] });
  const salProduct = createdProducts.find(p => p.name.includes('Sal para Piscinas'));
  if(salProduct) { await prisma.consumption.create({ data: { visitId: okVisit.id, productId: salProduct.id, quantity: 1 }}); }
  console.log('   - 1 visita COMPLETADA OK (con consumo de sal) creada.');
  
  const criticalVisitNotes = 'Fuga de agua detectada en la tubería principal del skimmer. Gotea constantemente, el nivel de la piscina ha bajado notablemente.';
  const criticalVisit = await prisma.visit.create({ data: { timestamp: threeDaysAgo, poolId: allPools[0]!.id, technicianId: technicians[0]!.id, status: 'COMPLETED', hasIncident: true, notes: criticalVisitNotes, completedTasks: ['Limpieza de cestos de skimmers'] } });
  await prisma.visitResult.createMany({ data: [ { visitId: criticalVisit.id, parameterName: 'Nivel del Agua en Skimmer', value: 'Bajo' }, { visitId: criticalVisit.id, parameterName: 'Nivel de pH', value: '7.9' }, ] });
  await prisma.notification.create({ data: { message: criticalVisitNotes, visitId: criticalVisit.id, tenantId: mainTenant.id, userId: adminUser.id, createdAt: threeDaysAgo, } });
  console.log('   - 1 incidencia CRÍTICA (de hace 3 días) creada.');

  const pendingVisitNotes = 'El nivel de sal es bajo, pero no hay producto en el almacén. Avisar para reponer.';
  const pendingVisit = await prisma.visit.create({ data: { timestamp: today, poolId: allPools[1]!.id, technicianId: technicians[1]!.id, status: 'COMPLETED', hasIncident: true, notes: pendingVisitNotes, completedTasks: ['Limpieza de cestos de skimmers'] } });
  await prisma.visitResult.createMany({ data: [{ visitId: pendingVisit.id, parameterName: 'Nivel de Sal (para piscinas de sal)', value: '3800', parameterUnit: 'ppm' }] });
  await prisma.notification.create({ data: { message: pendingVisitNotes, visitId: pendingVisit.id, tenantId: mainTenant.id, userId: adminUser.id, } });
  console.log('   - 1 incidencia PENDIENTE (de hoy) creada.');
  
  const classifiedVisitNotes = 'La bomba de calor hace un ruido metálico muy fuerte al arrancar. Podría romperse. Recomiendo no encenderla hasta que se revise.';
  const classifiedVisit = await prisma.visit.create({ data: { timestamp: today, poolId: allPools[4]!.id, technicianId: technicians[2]!.id, status: 'COMPLETED', hasIncident: true, notes: classifiedVisitNotes, completedTasks: ['Limpieza de cestos de skimmers', 'Cepillado de paredes y línea de flotación'] } });
  await prisma.visitResult.createMany({ data: [ { visitId: classifiedVisit.id, parameterName: 'Temperatura del Agua', value: '24', parameterUnit: '°C' }, { visitId: classifiedVisit.id, parameterName: 'Presión del Filtro', value: '1.5', parameterUnit: 'bar' }, ] });
  await prisma.notification.create({ data: { message: classifiedVisitNotes, visitId: classifiedVisit.id, tenantId: mainTenant.id, userId: adminUser.id, priority: 'HIGH',  resolutionDeadline: tomorrow, } });
  console.log('   - 1 incidencia PENDIENTE CLASIFICADA (Prioridad ALTA) creada.');

  // ✅ 2. AÑADIR LA NUEVA SECCIÓN PARA CREAR CONSUMOS ADICIONALES
  console.log('   - Creando consumos de productos adicionales...');
  const allVisits = await prisma.visit.findMany();
  let consumptionCount = 0;

  for (const consumptionSeed of consumptionsData) {
    const visit = allVisits.find(v => v.notes?.includes(consumptionSeed.visitNotesIdentifier));
    if (!visit) {
      console.warn(`   - ⚠️  No se encontró la visita para el consumo con identificador: "${consumptionSeed.visitNotesIdentifier}"`);
      continue;
    }

    for (const consumption of consumptionSeed.consumptions) {
      const product = createdProducts.find(p => p.name === consumption.productName);
      if (!product) {
        console.warn(`   - ⚠️  No se encontró el producto: "${consumption.productName}"`);
        continue;
      }
      await prisma.consumption.create({
        data: {
          visitId: visit.id,
          productId: product.id,
          quantity: consumption.quantity,
        }
      });
      consumptionCount++;
    }
  }
  console.log(`     - ${consumptionCount} registros de consumo adicionales creados.`);

  // 6. --- SIMULACIÓN DE TICKETING AVANZADO ---
  console.log('   - Creando tareas de incidencia y logs de auditoría...');
  const allNotifications = await prisma.notification.findMany({ where: { tenantId: mainTenant.id } });
  let taskCount = 0;
  for (const taskSeed of incidentTasksData) {
    const parentNotification = allNotifications.find(n => n.message.includes(taskSeed.notificationMessage));
    if (!parentNotification) { console.warn(`   - ⚠️  No se encontró la notificación padre para la tarea: "${taskSeed.task.title}"`); continue; }
    
    const assignedUser = taskSeed.task.title.includes('Contactar') ? adminUser : technicians[taskCount % technicians.length];
    if (!assignedUser) continue;

    const taskData = { ...taskSeed.task, notificationId: parentNotification.id, assignedToId: assignedUser.id, tenantId: mainTenant.id };
    const createdTask = await prisma.incidentTask.create({ data: taskData });
    taskCount++;

    await prisma.incidentTaskLog.create({ data: { action: 'CREATION', details: `Tarea creada por ${adminUser.name}. Asignada a ${assignedUser.name}.`, incidentTaskId: createdTask.id, userId: adminUser.id, }});
    if (createdTask.status !== 'PENDING') {
      await prisma.incidentTaskLog.create({ data: { action: 'STATUS_CHANGE', details: `Estado cambiado a ${createdTask.status}.`, incidentTaskId: createdTask.id, userId: assignedUser.id, }});
    }
  }
  console.log(`     - ${taskCount} tareas de incidencia creadas con sus logs.`);


  console.log('\n\n✅ Seeding de demostración completado con éxito!');
  console.log('--- Credenciales de prueba ---');
  console.log('SuperAdmin: super@admin.com / superadmin123');
  console.log('Admin:      admin@piscival.com / password123');
  console.log('Técnicos:   carlos.t@piscival.com, ana.t@piscival.com, leo.a@piscival.com (pass: password123)');
  console.log('Manager:    manager@piscival.com / password123');
}

function createPoolMaintenanceSheet(
  poolId: string,
  allParams: ParameterTemplate[],
  allTasks: ScheduledTaskTemplate[],
  poolType: string | null
): any[] {
  const configs: any[] = [];
  const commonParams = allParams.filter(p => ['Nivel de pH', 'Alcalinidad Total (TA)', 'Estado del Agua'].includes(p.name));
  for (const param of commonParams) {
    configs.push({ poolId, parameterTemplateId: param.id, frequency: 'SEMANAL' as Frequency, minThreshold: param.name.includes('pH') ? 7.2 : null, maxThreshold: param.name.includes('pH') ? 7.6 : null, });
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
    if (salParam) { configs.push({ poolId, parameterTemplateId: salParam.id, frequency: 'MENSUAL' as Frequency }); }
    if (salTask) { configs.push({ poolId, taskTemplateId: salTask.id, frequency: 'QUINCENAL' as Frequency }); }
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

main().catch((e) => { console.error('❌ Error fatal durante el proceso de seeding:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });