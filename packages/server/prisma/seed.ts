// filename: packages/server/prisma/seed.ts
// version: 10.0.5 (FIX: Remove direct tenantId assignment on Visit creation)
// description: Se corrige un error de tipo de Prisma eliminando la asignación directa de `tenantId` al crear una Visita, ya que esta relación es implícita a través de la Piscina.

/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import type { DayOfWeek, User, Pool, Product, Client, ProductCategory, Zone, ParameterTemplate, ScheduledTaskTemplate, Visit, Notification, VisitFrequency } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';
import { addDays, startOfWeek, subWeeks, format } from 'date-fns';

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
import { userAvailabilitiesData } from './data/user-availabilities.js';

const prisma = new PrismaClient();

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

async function main() {
  console.log('🌱 Empezando proceso de seeding v10.5 (Operación Caos Controlado - Corregido)...');

  // ... (toda la sección 1 se mantiene igual)
  const systemTenant = await prisma.tenant.create({ data: { companyName: 'SYSTEM_INTERNAL', subdomain: 'system', subscriptionStatus: 'ACTIVE' } });
  const superAdminPassword = await hashPassword('superadmin123');
  await prisma.user.create({ data: { email: 'super@admin.com', name: 'Super Admin', password: superAdminPassword, role: 'SUPER_ADMIN', tenantId: systemTenant.id } });
  
  const mainTenant = await prisma.tenant.create({ data: { companyName: 'Piscival S.L.', subdomain: 'piscival', subscriptionStatus: 'ACTIVE' } });
  console.log(`\n🏢 Tenant de prueba creado: ${mainTenant.companyName}`);

  const createdUsers: User[] = [];
  for (const userData of usersData) {
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({ data: { ...userData, password: hashedPassword, tenantId: mainTenant.id } });
    createdUsers.push(user);
  }
  const adminUser = createdUsers.find(u => u.role === 'ADMIN');
  const managerUser = createdUsers.find(u => u.role === 'MANAGER');
  const technicians = createdUsers.filter(u => u.role === 'TECHNICIAN');
  if (!adminUser || !managerUser || technicians.length === 0) throw new Error('Seeding fallido: No se encontraron suficientes usuarios con los roles necesarios.');
  console.log(`   👤 Creados ${createdUsers.length} usuarios.`);

  const createdParams: ParameterTemplate[] = [];
  for (const p of parameterData) { createdParams.push(await prisma.parameterTemplate.create({ data: { ...p, tenantId: mainTenant.id } })); }
  console.log(`   📊 Creados ${createdParams.length} parámetros.`);

  const createdTasks: ScheduledTaskTemplate[] = [];
  for (const t of taskData) { createdTasks.push(await prisma.scheduledTaskTemplate.create({ data: { ...t, tenantId: mainTenant.id } })); }
  console.log(`   📋 Creadas ${createdTasks.length} tareas.`);

  const createdCategories: ProductCategory[] = [];
  for (const catData of productCategoriesData) { createdCategories.push(await prisma.productCategory.create({ data: { ...catData, tenantId: mainTenant.id } })); }
  console.log(`   📁 Creadas ${createdCategories.length} categorías de productos.`);

  const createdProducts: Product[] = [];
  for (const prodData of productData) {
    const { categoryName, ...restOfProdData } = prodData;
    const category = createdCategories.find(c => c.name === categoryName);
    createdProducts.push(await prisma.product.create({ data: { ...restOfProdData, tenantId: mainTenant.id, categoryId: category?.id } }));
  }
  console.log(`   📦 Creados ${createdProducts.length} productos.`);
    
  const createdZones: Zone[] = [];
  for(const zone of zonesData) { createdZones.push(await prisma.zone.create({ data: { ...zone, tenantId: mainTenant.id }})); }
  console.log(`   🌍 Creadas ${createdZones.length} zonas geográficas.`);

  const allPools: Pool[] = [];
  const createdClients: Client[] = [];
  for (const data of clientsData) {
    const client = await prisma.client.create({ data: { ...data.client, tenantId: mainTenant.id } });
    createdClients.push(client);
    for (const poolData of data.pools) {
      const zone = createdZones.find(z => z.name === poolData.zoneName);
      const { zoneName, ...restOfPoolData } = poolData;
      const pool = await prisma.pool.create({ data: { ...restOfPoolData, clientId: client.id, tenantId: mainTenant.id, zoneId: zone?.id } });
      allPools.push(pool);
    }
  }
  console.log(`   👨‍💼 Creados ${createdClients.length} clientes y ${allPools.length} piscinas.`);
  
  for (const rtData of routeTemplatesData) {
      const technician = createdUsers.find(u => u.name === rtData.technicianName);
      const zonesToConnect = createdZones.filter(z => rtData.zoneNames.includes(z.name));
      await prisma.routeTemplate.create({
        data: {
          name: rtData.name,
          dayOfWeek: rtData.dayOfWeek as DayOfWeek,
          technicianId: technician?.id,
          tenantId: mainTenant.id,
          zones: { connect: zonesToConnect.map(z => ({ id: z.id })) },
          seasons: { create: rtData.seasons.map(s => ({...s, frequency: s.frequency as VisitFrequency})) },
        },
      });
  }
  console.log(`   🗺️  Creadas ${routeTemplatesData.length} rutas maestras.`);
  
  for (const rule of clientPricingRulesData) {
    const client = createdClients.find(c => c.name === rule.clientName);
    if (!client) continue;
    const product = rule.productName ? createdProducts.find(p => p.name === rule.productName) : null;
    const category = rule.categoryName ? createdCategories.find(c => c.name === rule.categoryName) : null;
    await prisma.clientProductPricing.create({ data: { clientId: client.id, productId: product?.id, productCategoryId: category?.id, discountPercentage: rule.discountPercentage } });
  }
  console.log(`   💰 Creadas ${clientPricingRulesData.length} reglas de precios.`);
  
  const paymentsToCreate = paymentsData.map(p => {
      const client = createdClients.find(c => c.name === p.clientName);
      return { amount: p.amount, paymentDate: p.paymentDate, method: p.method, notes: p.notes, clientId: client!.id, }
  });
  await prisma.payment.createMany({ data: paymentsToCreate });
  console.log(`   💳 Creados ${paymentsData.length} registros de pagos.`);

  await prisma.expense.createMany({ data: expensesData.map(e => ({ ...e, tenantId: mainTenant.id })) });
  console.log(`   💸 Creados ${expensesData.length} registros de gastos.`);
  

  console.log('\n🔄 Simulando historial operativo de 4 semanas...');
  const allVisits: Visit[] = [];
  const templates = await prisma.routeTemplate.findMany({ include: { zones: true, technician: true } });

  for (let weekIndex = 3; weekIndex >= 0; weekIndex--) {
    const targetWeekStart = startOfWeek(subWeeks(new Date(), weekIndex), { weekStartsOn: 1 });
    console.log(`   - Procesando semana del ${format(targetWeekStart, 'dd/MM/yyyy')}...`);

    for (const template of templates) {
        const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(template.dayOfWeek);
        if (dayIndex === -1) continue;

        const visitDate = addDays(targetWeekStart, dayIndex);
        const zoneIds = template.zones.map(z => z.id);

        const poolsInRoute = await prisma.pool.findMany({
            where: {
                tenantId: mainTenant.id,
                zoneId: { in: zoneIds }
            }
        });

        for (const pool of poolsInRoute) {
            // ✅ CORRECCIÓN: Se elimina la asignación directa de tenantId
            const visit = await prisma.visit.create({
                data: {
                    poolId: pool.id,
                    timestamp: visitDate,
                    technicianId: template.technicianId,
                }
            });
            allVisits.push(visit);
        }
    }
  }
  console.log(`   ✅ Generadas ${allVisits.length} visitas en total para el último mes.`);
  
  console.log('   - Procesando visitas para simular actividad...');
  let completedCount = 0;
  const createdNotifications: Notification[] = [];

  for (const visit of allVisits) {
    // Si la visita no es de la semana actual
    if (visit.timestamp < startOfWeek(new Date(), { weekStartsOn: 1 })) {
      if (Math.random() < 0.9) { // 90% de probabilidad de completarla
        const hasIncident = Math.random() < 0.2; // 20% de las visitas completadas tienen incidencia
        const consumptionSeed = getRandomItem(consumptionsData);
        
        await prisma.visit.update({
          where: { id: visit.id },
          data: {
            status: 'COMPLETED',
            notes: hasIncident ? consumptionSeed.visitNotesIdentifier : 'Mantenimiento rutinario completado sin novedad.',
            hasIncident,
          }
        });

        if(hasIncident && consumptionSeed.consumptions.length > 0) {
            for(const cons of consumptionSeed.consumptions) {
                const product = createdProducts.find(p => p.name === cons.productName);
                if (product) {
                    await prisma.consumption.create({
                        data: { visitId: visit.id, productId: product.id, quantity: cons.quantity }
                    });
                }
            }
        }

        if (hasIncident) {
          createdNotifications.push(await prisma.notification.create({
            data: {
              message: consumptionSeed.visitNotesIdentifier,
              visitId: visit.id,
              tenantId: mainTenant.id,
              userId: adminUser.id,
              priority: 'NORMAL',
            }
          }));
        }
        completedCount++;
      }
    }
  }
  console.log(`   - Marcadas ${completedCount} visitas como completadas.`);
  console.log(`   - Creadas ${createdNotifications.length} incidencias a partir de visitas.`);

  let taskCount = 0;
  for (const tSeed of incidentTasksData) {
      const targetNotification = createdNotifications.find(n => n.message.includes(tSeed.notificationMessage.substring(0, 20)));
      if (!targetNotification) {
          const randomVisit = getRandomItem(allVisits.filter(v => v.hasIncident));
          if (randomVisit) {
             const newNotification = await prisma.notification.create({data: {message: tSeed.notificationMessage, visitId: randomVisit.id, tenantId: mainTenant.id, userId: adminUser.id, priority: tSeed.task.priority}});
             createdNotifications.push(newNotification);
          }
      }
      const finalNotification = createdNotifications.find(n => n.message.includes(tSeed.notificationMessage.substring(0, 20)));
      if (!finalNotification) continue;

      let assignee: User | undefined;
      if (tSeed.task.title.includes('Llamar al cliente')) {
        assignee = managerUser;
      } else {
        assignee = getRandomItem(technicians);
      }

      if (assignee) {
        await prisma.incidentTask.create({ 
            data: { 
                ...tSeed.task, 
                notificationId: finalNotification.id, 
                assignedToId: assignee.id, 
                tenantId: mainTenant.id, 
                createdById: adminUser.id 
            }
        });
        taskCount++;
      }
  }
  console.log(`   - Asignadas ${taskCount} tareas de seguimiento.`);
  
  for (const availability of userAvailabilitiesData) {
      const { userName, ...restOfAvailabilityData } = availability; 
      const user = createdUsers.find(u => u.name === userName);
      if (user) {
          await prisma.userAvailability.create({ 
              data: { 
                  ...restOfAvailabilityData, 
                  userId: user.id, 
                  tenantId: mainTenant.id 
                } 
            });
      }
  }
  console.log(`   - Creadas ${userAvailabilitiesData.length} ausencias planificadas.`);

  console.log('\n\n✅ Seeding de "Caos Controlado" completado con éxito!');
  console.log('--- La base de datos ahora simula un entorno operativo mucho más realista. ---');

}

main()
  .catch((e) => {
    console.error('❌ Error fatal durante el proceso de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });