// filename: packages/server/src/api/dashboard/dashboard.service.ts
// version: 1.1.1 (FIXED)
// description: Corrige la consulta de consumos para incluir los datos de la visita.

import { PrismaClient } from '@prisma/client';
import { startOfMonth, subDays } from 'date-fns';

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
  }[];
  topProductsByCost: {
    productId: string;
    productName: string;
    totalCost: number;
  }[];
}

export const getManagerDashboardData = async (tenantId: string): Promise<DashboardData> => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const startOfCurrentMonth = startOfMonth(today);

  // --- 1. Datos Financieros (Últimos 30 días) ---
  const expenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { tenantId, expenseDate: { gte: thirtyDaysAgo, lte: today } },
  });

  // ✅ CORRECCIÓN: La consulta ahora incluye la visita y el cliente asociado
  const consumptions = await prisma.consumption.findMany({
    where: {
      visit: {
        pool: { tenantId },
        timestamp: { gte: thirtyDaysAgo, lte: today },
      },
    },
    include: {
      product: true,
      visit: {
        include: {
          pool: {
            select: { clientId: true }, // Solo necesitamos el clientId aquí
          },
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
      createdAt: { gte: startOfCurrentMonth },
    },
  });

  // --- 3. Top 5 Clientes por Rentabilidad ---
  const clientsWithPricing = await prisma.client.findMany({
    where: { tenantId },
    include: { pricingRules: true },
  });

  const clientProfits = clientsWithPricing.map(client => {
    let clientRevenue = client.monthlyFee;
    // Ahora esta línea es segura porque la consulta de consumptions incluye la visita.
    const clientConsumptions = consumptions.filter(c => c.visit.pool.clientId === client.id);

    if (client.billingModel !== 'ALL_INCLUSIVE') {
      for (const consumption of clientConsumptions) {
        const product = consumption.product;
        let finalSalePrice = product.salePrice;
        const productRule = client.pricingRules.find(r => r.productId === product.id);
        const categoryRule = client.pricingRules.find(r => r.productCategoryId === product.categoryId);

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
      netProfit: clientRevenue - clientCosts,
    };
  });

  const topClientsByProfit = clientProfits
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, 5);


  // --- 4. Top 5 Productos por Coste ---
  const productCosts = await prisma.consumption.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    where: {
        visit: {
            pool: { tenantId },
            timestamp: { gte: thirtyDaysAgo, lte: today },
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
  };
};