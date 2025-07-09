// filename: packages/server/prisma/seed.ts
// version: 2.0.7
// description: Script de seeding que ahora crea una visita completada con resultados reales (VisitResult).

import { PrismaClient } from '@prisma/client';
import type { Frequency, ParameterTemplate, ScheduledTaskTemplate, User, Pool } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';

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
  console.log('🌱 Empezando el proceso de seeding...');

  // 1. --- RESET COMPLETO DE LA BASE DE DATOS ---
  console.log('🗑️  Limpiando la base de datos (orden inverso a la creación)...');
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
  console.log('✅ Base de datos reseteada a un estado limpio.');

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
  // Usamos createManyAndReturn porque no tienen campos @updatedAt, es más eficiente
  const createdParams = await prisma.parameterTemplate.createManyAndReturn({ data: parameterData.map(p => ({ ...p, tenantId: mainTenant.id })) });
  console.log(`\n📊 Creados ${createdParams.length} parámetros en el catálogo.`);
  const createdTasks = await prisma.scheduledTaskTemplate.createManyAndReturn({ data: taskData.map(t => ({ ...t, tenantId: mainTenant.id })) });
  console.log(`📋 Creadas ${createdTasks.length} tareas en el catálogo.`);

  // 5. --- CREACIÓN DE CLIENTES, PISCINAS Y FICHAS ---
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

  // 6. --- SIMULACIÓN DE DATOS PARA EL DÍA ACTUAL ---
  console.log('\n⚙️  Simulando datos para el dashboard de hoy...');
  const today = new Date();
  
  await prisma.visit.create({ data: { timestamp: today, poolId: allPools[0]!.id, technicianId: technicians[0]!.id, status: 'PENDING' }});
  await prisma.visit.create({ data: { timestamp: today, poolId: allPools[2]!.id, technicianId: technicians[1]!.id, status: 'PENDING' }});
  
  // --- SIMULACIÓN DE PARTE RELLENADO ---
  const incidentVisit = await prisma.visit.create({
    data: {
      timestamp: today,
      poolId: allPools[4]!.id,
      technicianId: technicians[2]!.id,
      status: 'COMPLETED',
      hasIncident: true,
      notes: 'La bomba de calor hace un ruido extraño al arrancar. Revisar urgentemente.',
      completedTasks: ['Limpieza de cestos de skimmers', 'Cepillado de paredes y línea de flotación'],
    }
  });
  
  // Creación de los resultados de la visita (VisitResult)
  await prisma.visitResult.createMany({
    data: [
      { visitId: incidentVisit.id, parameterName: 'Nivel de pH', value: '7.8', parameterUnit: 'pH' },
      { visitId: incidentVisit.id, parameterName: 'Cloro Libre (DPD-1)', value: '0.5', parameterUnit: 'ppm' },
      { visitId: incidentVisit.id, parameterName: 'Estado del Agua', value: 'Ligeramente turbia', parameterUnit: null },
    ]
  });
  console.log('   - 1 visita completada con incidencia y resultados reales.');

  // Creación de la notificación para la incidencia
  await prisma.notification.create({
    data: {
      message: `Incidencia en ${allPools[4]!.name} por ${technicians[2]!.name}.`,
      tenantId: mainTenant.id,
      userId: adminUser.id,
      visitId: incidentVisit.id,
      status: 'PENDING',
    }
  });
  console.log('   - 1 notificación de incidencia creada para el admin.');
  console.log('   - 2 visitas pendientes asignadas para hoy.');

  console.log('\n\n✅ Seeding completado con éxito!');
  console.log('--- Credenciales de prueba ---');
  console.log('SuperAdmin: super@admin.com / superadmin123');
  console.log('Admin:      admin@piscival.com / password123');
  console.log('Técnicos:   carlos.t@piscival.com, ana.t@piscival.com, leo.a@piscival.com (pass: password123)');
  console.log('Manager:    manager@piscival.com / password123');
}

/**
 * Función de lógica de negocio para generar una ficha de mantenimiento realista
 * para una piscina, basada en su tipo y en los catálogos disponibles.
 * ESTA ES LA VERSIÓN COMPLETA SIN ABREVIAR.
 */
function createPoolMaintenanceSheet(
  poolId: string,
  allParams: ParameterTemplate[],
  allTasks: ScheduledTaskTemplate[],
  poolType: string | null
): any[] {
  const configs: any[] = [];

  // Parámetros comunes a todas las piscinas (SEMANAL)
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

  // Tareas comunes a todas las piscinas (SEMANAL)
  const commonTasks = allTasks.filter(t => ['Limpieza de cestos de skimmers', 'Cepillado de paredes y línea de flotación'].includes(t.name));
  for (const task of commonTasks) {
    configs.push({ poolId, taskTemplateId: task.id, frequency: 'SEMANAL' as Frequency });
  }

  // Tarea de contralavado (QUINCENAL)
  const backwashTask = allTasks.find(t => t.name.includes('Contralavado'));
  if (backwashTask) {
    configs.push({ poolId, taskTemplateId: backwashTask.id, frequency: 'QUINCENAL' as Frequency });
  }

  // Lógica específica por tipo de piscina
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
  
  // Añadimos 2 parámetros aleatorios adicionales para dar variedad
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