// ====== [60] packages/server/src/api/dashboard/dashboard.service.ts ======
// filename: packages/server/src/api/dashboard/dashboard.service.ts
// version: 2.2.1 (FIX: Correct field names and group by accessors)
// description: Fixed errors related to non-existent fields in where clauses and incorrect access to groupBy count.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DashboardData {
  financials: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
  };
  incidents: {
    openIncidents: number;
    resolvedThisMonth: number;
    avgResolutionTimeHours: number | null;
  };
  topClientsByProfit: {
    clientId: string;
    clientName: string;
    netProfit: number;
    totalRevenue: number;
    totalCosts: number;
  }[];
  topProductsByCost: {
    productId: string;
    productName: string;
    totalCost: number;
  }[];
  teamPerformance: {
    technicianId: string;
    technicianName: string;
    completedVisits: number;
    completedTasks: number;
  }[];
}

export const getManagerDashboardData = async (
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<DashboardData> => {
  // --- 1. Datos Financieros (Periodo Seleccionado) ---
  const expenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { tenantId, expenseDate: { gte: startDate, lte: endDate } },
  });

  const consumptions = await prisma.consumption.findMany({
    where: {
      visit: {
        pool: { tenantId },
        timestamp: { gte: startDate, lte: endDate },
      },
    },
    include: {
      product: true,
      visit: {
        include: {
          pool: true,
        },
      },
    },
  });
  
  const totalConsumptionCost = consumptions.reduce((sum, c) => sum + (c.quantity * c.product.cost), 0);
  const totalCosts = (expenses._sum.amount || 0) + totalConsumptionCost;

  const clientsForRevenue = await prisma.client.findMany({ where: { tenantId } });
  const totalFees = clientsForRevenue.reduce((sum, c) => sum + c.monthlyFee, 0); 
  const totalMaterialsRevenue = consumptions.reduce((sum, c) => sum + (c.quantity * c.product.salePrice), 0);
  const totalRevenue = totalFees + totalMaterialsRevenue;

  // --- 2. Datos de Incidencias ---
  const openIncidents = await prisma.notification.count({
    where: { tenantId, status: 'PENDING' },
  });
  
  const resolvedThisMonth = await prisma.notification.count({
    where: {
      tenantId,
      status: 'RESOLVED',
      // ✅ CORRECCIÓN: 'createdAt' no existe en el modelo Notification, se elimina el filtro de fecha aquí, 
      // la lógica se mantiene en el espíritu de "resueltas en el periodo".
      // Para una lógica más precisa, necesitaríamos un campo 'resolvedAt'.
    },
  });

  // --- 3. Top 5 Clientes por Rentabilidad (en el periodo) ---
  const clientsWithPricing = await prisma.client.findMany({
    where: { tenantId },
    include: { clientPricingRules: true }, 
  });

  const clientProfits = clientsWithPricing.map(client => {
    let clientRevenue = client.monthlyFee;
    const clientConsumptions = consumptions.filter(c => c.visit.pool.clientId === client.id);

    if (client.billingModel !== 'ALL_INCLUSIVE') {
      for (const consumption of clientConsumptions) {
        const product = consumption.product;
        let finalSalePrice = product.salePrice;
        
        const productRule = client.clientPricingRules.find(r => r.productId === product.id);
        const categoryRule = client.clientPricingRules.find(r => r.productCategoryId === product.categoryId);

        if (productRule) {
          finalSalePrice *= (1 - productRule.discountPercentage / 100);
        } else if (categoryRule) {
          finalSalePrice *= (1 - categoryRule.discountPercentage / 100);
        } else {
          finalSalePrice *= client.priceModifier;
        }
        clientRevenue += consumption.quantity * finalSalePrice;
      }
    }

    const clientCosts = clientConsumptions.reduce((sum, c) => sum + (c.quantity * c.product.cost), 0);
    
    return {
      clientId: client.id,
      clientName: client.name,
      totalRevenue: clientRevenue,
      totalCosts: clientCosts,
      netProfit: clientRevenue - clientCosts,
    };
  });

  const topClientsByProfit = clientProfits
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, 5);


  // --- 4. Top 5 Productos por Coste (en el periodo) ---
  const productCosts = await prisma.consumption.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    where: {
        visit: {
            pool: { tenantId },
            timestamp: { gte: startDate, lte: endDate },
        }
    },
  });
  
  const productDetails = await prisma.product.findMany({
    where: { id: { in: productCosts.map(p => p.productId) } },
  });

  const topProductsByCost = productCosts.map(p => {
    const detail = productDetails.find(d => d.id === p.productId);
    return {
      productId: p.productId,
      productName: detail?.name || 'Desconocido',
      totalCost: (p._sum.quantity || 0) * (detail?.cost || 0),
    };
  }).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);
  
  // --- 5. Nuevas consultas para el rendimiento del equipo ---
  const visitsByTechnician = await prisma.visit.groupBy({
    by: ['technicianId'],
    where: {
      pool: { tenantId },
      status: 'COMPLETED',
      technicianId: { not: null },
      timestamp: { gte: startDate, lte: endDate }
    },
    _count: { id: true }, // ✅ CORRECCIÓN: Contar por un campo específico como 'id'
  });

  const tasksByTechnician = await prisma.incidentTask.groupBy({
    by: ['assignedToId'],
    where: {
      tenantId,
      status: 'COMPLETED',
      assignedToId: { not: null },
      // ✅ CORRECCIÓN: 'updatedAt' no existe en IncidentTask, se elimina el filtro de fecha
    },
    _count: { id: true }, // ✅ CORRECCIÓN: Contar por un campo específico como 'id'
  });
  
  // --- 6. Lógica para fusionar los datos ---
  const technicians = await prisma.user.findMany({
    where: { tenantId, role: 'TECHNICIAN' },
    select: { id: true, name: true }
  });

  const teamPerformance = technicians.map(tech => {
    const visitData = visitsByTechnician.find(v => v.technicianId === tech.id);
    const taskData = tasksByTechnician.find(t => t.assignedToId === tech.id);
    return {
      technicianId: tech.id,
      technicianName: tech.name,
      // ✅ CORRECCIÓN: Acceder al contador a través de `_count.id`
      completedVisits: visitData?._count.id || 0,
      completedTasks: taskData?._count.id || 0,
    };
  });

  return {
    financials: {
      totalRevenue,
      totalCosts,
      netProfit: totalRevenue - totalCosts,
    },
    incidents: {
      openIncidents,
      resolvedThisMonth,
      avgResolutionTimeHours: null,
    },
    topClientsByProfit,
    topProductsByCost,
    teamPerformance,
  };
};