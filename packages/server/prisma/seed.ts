// ====== [48] packages/server/prisma/seed.ts ======
// filename: packages/server/prisma/seed.ts
// version: 9.0.1 (FIX: Correctly map payment data for createMany)

import { PrismaClient } from '@prisma/client';
// Se importan los tipos necesarios, incluyendo los nuevos
import type { DayOfWeek, User, Pool, Product, Client, ProductCategory, Zone, ParameterTemplate, ScheduledTaskTemplate, Visit, Notification } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';
import { addDays, startOfWeek } from 'date-fns';

// --- Importación de todos los datos modulares, incluyendo los nuevos ---
import { usersData } from './data/users.js';
import { parameterData, taskData } from './data/catalogs.js';
import { clientsData } from './data/clients.js';
import { productData } from './data/products.js';
import { incidentTasksData } from './data/incident-tasks.js';
import { productCategoriesData } from './data/product-categories.js';
import { clientPricingRulesData } from './data/financial-rules.js';
import { paymentsData, expensesData } from './data/transactions.js';
import { zonesData } from './data/zones.js';
import { routeTemplatesData } from './data/route-templates.js';
import { consumptionsData } from './data/consumptions.js';


// --- Script Principal ---
async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🌱 Empezando el proceso de seeding v9.1 (Estable + Planificación Avanzada)...');

    // 1. --- CREACIÓN DE ENTIDADES DEL SISTEMA ---
    const systemTenant = await prisma.tenant.create({ data: { companyName: 'SYSTEM_INTERNAL', subdomain: 'system', subscriptionStatus: 'ACTIVE' } });
    const superAdminPassword = await hashPassword('superadmin123');
    await prisma.user.create({ data: { email: 'super@admin.com', name: 'Super Admin', password: superAdminPassword, role: 'SUPER_ADMIN', tenantId: systemTenant.id } });
    console.log('👑 SuperAdmin y Tenant del sistema creados.');

    // 2. --- CREACIÓN DEL TENANT DE PRUEBA Y USUARIOS ---
    const mainTenant = await prisma.tenant.create({ data: { companyName: 'Piscival S.L.', subdomain: 'piscival', subscriptionStatus: 'ACTIVE' } });
    console.log(`\n🏢 Tenant de prueba creado: ${mainTenant.companyName}`);
    
    const createdUsers: User[] = [];
    for (const userData of usersData) {
      const hashedPassword = await hashPassword(userData.password);
      const user = await prisma.user.create({ data: { ...userData, password: hashedPassword, tenantId: mainTenant.id } });
      createdUsers.push(user);
    }
    const adminUser = createdUsers.find(u => u.role === 'ADMIN');
    const technicians = createdUsers.filter(u => u.role === 'TECHNICIAN');
    if (!adminUser || technicians.length === 0) throw new Error('Seeding fallido: No se encontraron suficientes usuarios admin o técnicos.');
    console.log(`   👤 Creados ${createdUsers.length} usuarios.`);


    // 3. --- CREACIÓN DE CATÁLOGOS, ZONAS Y ENTIDADES FINANCIERAS BASE ---
    console.log('\n- Fase de creación de catálogos y finanzas -');

    const createdParams: ParameterTemplate[] = [];
    for (const p of parameterData) { createdParams.push(await prisma.parameterTemplate.create({ data: { ...p, tenantId: mainTenant.id } })); }
    console.log(`📊 Creados ${createdParams.length} parámetros en el catálogo.`);

    const createdTasks: ScheduledTaskTemplate[] = [];
    for (const t of taskData) { createdTasks.push(await prisma.scheduledTaskTemplate.create({ data: { ...t, tenantId: mainTenant.id } })); }
    console.log(`📋 Creadas ${createdTasks.length} tareas en el catálogo.`);

    const createdCategories: ProductCategory[] = [];
    for (const catData of productCategoriesData) { createdCategories.push(await prisma.productCategory.create({ data: { ...catData, tenantId: mainTenant.id } })); }
    console.log(`📁 Creadas ${createdCategories.length} categorías de productos.`);

    const createdProducts: Product[] = [];
    for (const prodData of productData) {
      const { categoryName, ...restOfProdData } = prodData;
      const category = createdCategories.find(c => c.name === categoryName);
      createdProducts.push(await prisma.product.create({ data: { ...restOfProdData, tenantId: mainTenant.id, categoryId: category?.id } }));
    }
    console.log(`📦 Creados ${createdProducts.length} productos en el catálogo.`);
    
    const createdZones: Zone[] = [];
    for(const zone of zonesData) { createdZones.push(await prisma.zone.create({ data: { ...zone, tenantId: mainTenant.id }})); }
    console.log(`🌍 Creadas ${createdZones.length} zonas geográficas.`);

    // 4. --- CREACIÓN DE CLIENTES Y PISCINAS ---
    console.log('\n- Fase de creación de clientes y piscinas -');
    const allPools: Pool[] = [];
    const createdClients: Client[] = [];
    for (const data of clientsData) {
      const client = await prisma.client.create({ data: { ...data.client, tenantId: mainTenant.id } });
      createdClients.push(client);
      console.log(`\n👨‍💼 Cliente creado: ${client.name}`);
      for (const poolData of data.pools) {
        const zone = createdZones.find(z => z.name === poolData.zoneName);
        const { zoneName, ...restOfPoolData } = poolData;
        const pool = await prisma.pool.create({ data: { ...restOfPoolData, clientId: client.id, tenantId: mainTenant.id, zoneId: zone?.id } });
        allPools.push(pool);
        console.log(`   🏊 Piscina creada: ${pool.name} en Zona: ${zone?.name}`);
        
        for(let i = 0; i < 5 && i < createdParams.length; i++) {
          await prisma.poolConfiguration.create({data: {poolId: pool.id, parameterTemplateId: createdParams[i]!.id }});
        }
        for(let i = 0; i < 3 && i < createdTasks.length; i++) {
          await prisma.poolConfiguration.create({data: {poolId: pool.id, taskTemplateId: createdTasks[i]!.id }});
        }
        console.log(`      📝 Ficha de mantenimiento creada para ${pool.name}.`);
      }
    }
    if (allPools.length < 5) throw new Error('Seeding fallido: No se crearon suficientes piscinas.');

    // 5. --- CREACIÓN DE RUTAS MAESTRAS, REGLAS DE PRECIOS Y TRANSACCIONES ---
    console.log('\n- Fase de creación de Rutas Maestras y Finanzas -');
    
    for (const rt of routeTemplatesData) {
      const technician = createdUsers.find(u => u.name === rt.technicianName);
      const zonesToConnect = createdZones.filter(z => rt.zoneNames.includes(z.name));
      await prisma.routeTemplate.create({
        data: {
          name: rt.name,
          dayOfWeek: rt.dayOfWeek as DayOfWeek,
          technicianId: technician?.id,
          tenantId: mainTenant.id,
          zones: { connect: zonesToConnect.map(z => ({ id: z.id })) },
          seasons: { create: rt.seasons }
        }
      });
    }
    console.log(`🗺️  Creadas ${routeTemplatesData.length} rutas maestras.`);
    
    for (const rule of clientPricingRulesData) {
      const client = createdClients.find(c => c.name === rule.clientName);
      if (!client) continue;
      const product = rule.productName ? createdProducts.find(p => p.name === rule.productName) : null;
      const category = rule.categoryName ? createdCategories.find(c => c.name === rule.categoryName) : null;
      await prisma.clientProductPricing.create({ data: { clientId: client.id, productId: product?.id, productCategoryId: category?.id, discountPercentage: rule.discountPercentage } });
    }
    console.log(`💰 Creadas ${clientPricingRulesData.length} reglas de precios personalizadas.`);
    
    // ✅ CORRECCIÓN: Construir el objeto de datos para createMany explícitamente.
    const paymentsToCreate = paymentsData.map(p => {
        const client = createdClients.find(c => c.name === p.clientName);
        return {
            amount: p.amount,
            paymentDate: p.paymentDate,
            method: p.method,
            notes: p.notes,
            clientId: client!.id,
        }
    });
    await prisma.payment.createMany({ data: paymentsToCreate });
    console.log(`💳 Creados ${paymentsData.length} registros de pagos.`);

    await prisma.expense.createMany({ data: expensesData.map(e => ({ ...e, tenantId: mainTenant.id })) });
    console.log(`💸 Creados ${expensesData.length} registros de gastos.`);

    // 6. --- SIMULACIÓN DE GENERACIÓN DE VISITAS Y ACTIVIDAD ---
    console.log('\n- Fase de simulación de actividad operativa -');
    const allRouteTemplates = await prisma.routeTemplate.findMany({ include: { zones: true } });
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const createdVisits: Visit[] = [];
    const dayOfWeekStrings: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    for (let i = 0; i < 5; i++) { // L-V
        const dayToSimulate = addDays(startOfThisWeek, i);
        const dayOfWeekStr = dayOfWeekStrings[i]!;
        const routesForDay = allRouteTemplates.filter(rt => rt.dayOfWeek === dayOfWeekStr);
        for (const route of routesForDay) {
            const poolsInRoute = await prisma.pool.findMany({ where: { zoneId: { in: route.zones.map(z => z.id) } } });
            const techData = routeTemplatesData.find(rtd => rtd.name === route.name);
            const tech = techData ? createdUsers.find(u => u.name === techData.technicianName) : null;
            for (const pool of poolsInRoute) {
                createdVisits.push(await prisma.visit.create({ data: { poolId: pool.id, timestamp: dayToSimulate, technicianId: tech?.id } }));
            }
        }
    }
    console.log(`   ✅ Generadas ${createdVisits.length} visitas para la semana actual a partir de Rutas Maestras.`);

    // 7. --- SIMULACIÓN DE ACTIVIDAD (INCIDENCIAS, CONSUMOS, TAREAS) SOBRE LAS VISITAS GENERADAS ---
    const allNotifications: Notification[] = [];
    for(let i=0; i < consumptionsData.length && i < createdVisits.length; i++){
        const visit = createdVisits[i]!;
        const cSeed = consumptionsData[i]!;

        await prisma.visit.update({ where: { id: visit.id }, data: { status: 'COMPLETED', notes: cSeed.visitNotesIdentifier, hasIncident: true }});
        
        const notification = await prisma.notification.create({ data: { message: cSeed.visitNotesIdentifier, visitId: visit.id, tenantId: mainTenant.id, userId: adminUser.id, priority: 'HIGH' }});
        allNotifications.push(notification);

        for(const cons of cSeed.consumptions) {
            const p = createdProducts.find(pr => pr.name === cons.productName);
            if(p) await prisma.consumption.create({ data: { visitId: visit.id, productId: p.id, quantity: cons.quantity }});
        }
    }
    console.log(`   - Marcadas ${allNotifications.length} visitas como completadas con datos de demo.`);

    let taskCount = 0;
    for (const tSeed of incidentTasksData) {
      const pNotification = allNotifications.find(n => n.message.includes(tSeed.notificationMessage));
      if (!pNotification) continue;
      
      const aUser = tSeed.task.title.includes('Contactar') ? adminUser : technicians.find(t => t.isAvailable);
      if (aUser) {
        await prisma.incidentTask.create({ data: { ...tSeed.task, notificationId: pNotification.id, assignedToId: aUser.id, tenantId: mainTenant.id } });
        taskCount++;
      }
    }
    console.log(`   - Creadas ${taskCount} tareas de incidencia.`);

    console.log('\n\n✅ Seeding de demostración v9.1 completado con éxito!');
    console.log('--- Credenciales de prueba ---');
    console.log('SuperAdmin: super@admin.com / superadmin123');
    console.log('Admin:      admin@piscival.com / password123');
    console.log('Técnicos:   carlos.t@piscival.com, ana.t@piscival.com, leo.a@piscival.com (pass: password123)');
    console.log('Manager:    manager@piscival.com / password123');

  } catch (e) {
    console.error('❌ Error fatal durante el proceso de seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();