// filename: packages/server/prisma/seed.ts
// version: 2.0.2
// description: Script orquestador para poblar la base de datos con un conjunto completo y realista de datos de prueba.

import { PrismaClient } from '@prisma/client';
// Corrección: Eliminadas importaciones no usadas (InputType, UserRole)
import type { Frequency, ParameterTemplate, ScheduledTaskTemplate } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';

// --- Importación de los datos modulares ---
import { usersData } from './data/users.js';
import { parameterData, taskData } from './data/catalogs.js';
import { clientsData } from './data/clients.js';

const prisma = new PrismaClient();

// --- Funciones de ayuda ---
// Corrección: Eliminada la función `getRandomItem` que no se usaba.

const getRandomItems = <T>(arr: T[], count: number): T[] => {
  if (arr.length < count) {
    throw new Error(`No se pueden obtener ${count} elementos de un array con solo ${arr.length} elementos.`);
  }
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  // Corrección del error principal: `slice` siempre devuelve un array, por lo que el tipo es correcto.
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

  // 2. --- CREACIÓN DE ENTIDADES DEL SISTEMA (NO SON DE PRUEBA) ---
  const systemTenant = await prisma.tenant.create({
    data: {
      companyName: 'SYSTEM_INTERNAL',
      subdomain: 'system',
      subscriptionStatus: 'ACTIVE',
    },
  });
  const superAdminPassword = await hashPassword('superadmin123');
  await prisma.user.create({
    data: {
      email: 'super@admin.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      tenantId: systemTenant.id,
    },
  });
  console.log('👑 SuperAdmin y Tenant del sistema creados.');

  // 3. --- CREACIÓN DEL TENANT DE PRUEBA Y SUS USUARIOS ---
  const mainTenant = await prisma.tenant.create({
    data: {
      companyName: 'Piscival S.L.',
      subdomain: 'piscival',
      subscriptionStatus: 'ACTIVE',
    },
  });
  console.log(`\n🏢 Tenant de prueba creado: ${mainTenant.companyName} (ID: ${mainTenant.id})`);

  for (const userData of usersData) {
    const hashedPassword = await hashPassword(userData.password);
    await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        tenantId: mainTenant.id,
      },
    });
    console.log(`   👤 Usuario creado: ${userData.name} (${userData.role})`);
  }

  // 4. --- CREACIÓN DE LOS CATÁLOGOS PARA EL TENANT DE PRUEBA ---
  const createdParams = await prisma.parameterTemplate.createManyAndReturn({
    data: parameterData.map(p => ({ ...p, tenantId: mainTenant.id })),
  });
  console.log(`\n📊 Creados ${createdParams.length} parámetros en el catálogo.`);

  const createdTasks = await prisma.scheduledTaskTemplate.createManyAndReturn({
    data: taskData.map(t => ({ ...t, tenantId: mainTenant.id })),
  });
  console.log(`📋 Creadas ${createdTasks.length} tareas en el catálogo.`);

  // 5. --- CREACIÓN DE CLIENTES, PISCINAS Y FICHAS DE MANTENIMIENTO ---
  for (const data of clientsData) {
    const client = await prisma.client.create({
      data: { ...data.client, tenantId: mainTenant.id },
    });
    console.log(`\n👨‍💼 Cliente creado: ${client.name}`);

    for (const poolData of data.pools) {
      const pool = await prisma.pool.create({
        data: { ...poolData, clientId: client.id, tenantId: mainTenant.id },
      });
      console.log(`   🏊 Piscina creada: ${pool.name}`);

      // --- Creación de la Ficha de Mantenimiento (PoolConfiguration) ---
      const configsToCreate = createPoolMaintenanceSheet(pool.id, createdParams, createdTasks, poolData.type);
      
      await prisma.poolConfiguration.createMany({
        data: configsToCreate,
        skipDuplicates: true,
      });
      console.log(`      📝 Ficha de mantenimiento creada para ${pool.name} con ${configsToCreate.length} ítems.`);
    }
  }

  console.log('\n\n✅ Seeding completado con éxito. ¡Ya puedes probar la aplicación!');
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