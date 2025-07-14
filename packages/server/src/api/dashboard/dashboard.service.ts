// filename: packages/server/src/api/dashboard/dashboard.service.ts
// version: 1.0.2 (FIXED)
// description: Elimina importaciones y variables no utilizadas.

import { PrismaClient } from '@prisma/client';
// --- ✅ Importación corregida ---
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
  // --- ✅ Variable no utilizada eliminada ---

  // --- 1. Datos Financieros (Últimos 30 días) ---
  const expenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { tenantId, expenseDate: { gte: thirtyDaysAgo, lte: today } },
  });

  const consumptions = await prisma.consumption.findMany({
    where: {
      visit: {
        pool: { tenantId },
        timestamp: { gte: thirtyDaysAgo, lte: today },
      },
    },
    include: { product: true },
  });
  const totalConsumptionCost = consumptions.reduce((sum, c) => sum + (c.quantity * c.product.cost), 0);
  const totalCosts = (expenses._sum.amount || 0) + totalConsumptionCost;

  const clients = await prisma.client.findMany({ where: { tenantId } });
  const totalFees = clients.reduce((sum, c) => sum + c.monthlyFee, 0);
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
  
  // TODO: Implementar cálculo de tiempo medio de resolución.

  // --- 3. Top 5 Clientes por Rentabilidad ---
  // TODO: Implementar lógica de rentabilidad por cliente.

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
    topClientsByProfit: [],
    topProductsByCost,
  };
};