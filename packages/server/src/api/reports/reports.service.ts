// ====== [90] packages/server/src/api/reports/reports.service.ts ======
// filename: packages/server/src/api/reports/reports.service.ts
// version: 1.4.0 (FEAT: Add productId filter to consumption report)
// description: The consumption report can now be filtered by a specific product ID.

import { PrismaClient } from '@prisma/client';
import type { ClientProductPricing } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Datos (Interfaces) ---

interface ReportFilters {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  clientId?: string;
  // ✅ 1. Añadir productId como filtro opcional
  productId?: string;
}

interface ConsumptionReport {
  summary: {
    totalCost: number;
    totalVisits: number;
  };
  byClient: {
    clientId: string;
    clientName: string;
    totalClientCost: number;
    visitCount: number;
    detailedConsumption: {
      productId: string;
      productName: string;
      unit: string;
      totalQuantity: number;
      totalCost: number;
    }[];
  }[];
}

interface DetailFilters extends ReportFilters {
    productId: string;
    clientId: string;
}

export interface ProductConsumptionDetail {
    visitId: string;
    visitDate: Date;
    quantity: number;
    cost: number;
    technicianName: string | null;
}

export interface InvoicingReport {
  summary: {
    totalToInvoice: number;
    totalFees: number;
    totalMaterials: number;
  };
  byClient: {
    clientId: string;
    clientName: string;
    billingModel: string;
    monthlyFee: number;
    materialsSubtotal: number;
    totalToInvoice: number;
    billedConsumption: {
      productId: string;
      productName: string;
      unit: string;
      totalQuantity: number;
      salePrice: number;
      totalLine: number;
    }[];
  }[];
}


// --- Funciones de Servicio ---

export const generateConsumptionReport = async (filters: ReportFilters): Promise<ConsumptionReport> => {
  const { tenantId, startDate, endDate, clientId, productId } = filters;

  const consumptions = await prisma.consumption.findMany({
    where: {
      // ✅ 2. Añadir la condición del productId a la consulta
      productId: productId ? productId : undefined,
      visit: {
        pool: {
          tenantId: tenantId,
          clientId: clientId ? clientId : undefined,
        },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      product: true,
      visit: { include: { pool: { include: { client: true } } } },
    },
  });
  
  const reportData: Record<string, any> = {};
  let overallTotalCost = 0;
  const visitedVisits = new Set<string>();

  for (const consumption of consumptions) {
    if (!consumption.visit || !consumption.visit.pool || !consumption.visit.pool.client) continue;
    
    const client = consumption.visit.pool.client;
    const product = consumption.product;
    const itemCost = consumption.quantity * product.cost;

    overallTotalCost += itemCost;
    visitedVisits.add(consumption.visitId);

    if (!reportData[client.id]) {
      reportData[client.id] = {
        clientId: client.id,
        clientName: client.name,
        totalClientCost: 0,
        visitCount: new Set<string>(),
        detailedConsumption: {},
      };
    }
    
    reportData[client.id].totalClientCost += itemCost;
    reportData[client.id].visitCount.add(consumption.visitId);
    
    const detailedConsumption = reportData[client.id].detailedConsumption;
    if (!detailedConsumption[product.id]) {
      detailedConsumption[product.id] = {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        totalQuantity: 0,
        totalCost: 0,
      };
    }
    
    detailedConsumption[product.id].totalQuantity += consumption.quantity;
    detailedConsumption[product.id].totalCost += itemCost;
  }
  
  const byClientArray = Object.values(reportData).map(clientData => ({
    ...clientData,
    visitCount: clientData.visitCount.size,
    detailedConsumption: Object.values(clientData.detailedConsumption),
  }));
  
  return {
    summary: {
      totalCost: overallTotalCost,
      totalVisits: visitedVisits.size,
    },
    byClient: byClientArray,
  };
};

export const getConsumptionDetailsForProduct = async (filters: DetailFilters): Promise<ProductConsumptionDetail[]> => {
    const { tenantId, startDate, endDate, clientId, productId } = filters;

    const consumptions = await prisma.consumption.findMany({
        where: {
            productId,
            visit: {
                pool: { clientId, tenantId },
                timestamp: { gte: startDate, lte: endDate }
            }
        },
        include: {
            product: true,
            visit: { include: { technician: { select: { name: true } } } }
        },
        orderBy: { visit: { timestamp: 'desc' } }
    });

    return consumptions.map(c => ({
        visitId: c.visitId,
        visitDate: c.visit.timestamp,
        quantity: c.quantity,
        cost: c.quantity * c.product.cost,
        technicianName: c.visit.technician?.name ?? 'No asignado',
    }));
};

export const generateInvoicingReport = async (filters: ReportFilters): Promise<InvoicingReport> => {
    const { tenantId, startDate, endDate, clientId } = filters;

    const clients = await prisma.client.findMany({
        where: {
            tenantId,
            id: clientId ? clientId : undefined,
        },
        include: {
            clientPricingRules: true, 
        },
    });

    const consumptions = await prisma.consumption.findMany({
        where: {
            visit: {
                pool: { tenantId, clientId: clientId ? clientId : undefined },
                timestamp: { gte: startDate, lte: endDate },
            },
        },
        include: {
            product: true,
            visit: { include: { pool: true } },
        },
    });

    const report: InvoicingReport = {
        summary: { totalToInvoice: 0, totalFees: 0, totalMaterials: 0 },
        byClient: [],
    };

    for (const client of clients) {
        const clientReport = {
            clientId: client.id,
            clientName: client.name,
            billingModel: client.billingModel,
            monthlyFee: client.monthlyFee,
            materialsSubtotal: 0,
            totalToInvoice: client.monthlyFee,
            billedConsumption: [] as InvoicingReport['byClient'][0]['billedConsumption'],
        };
        
        report.summary.totalFees += client.monthlyFee;

        if (client.billingModel === 'ALL_INCLUSIVE') {
            report.summary.totalToInvoice += client.monthlyFee;
            report.byClient.push(clientReport);
            continue;
        }

        const clientConsumptions = consumptions.filter(c => c.visit.pool.clientId === client.id);

        for (const consumption of clientConsumptions) {
            const product = consumption.product;
            let finalSalePrice = product.salePrice;

            const productRule = client.clientPricingRules.find((r: ClientProductPricing) => r.productId === product.id);
            const categoryRule = client.clientPricingRules.find((r: ClientProductPricing) => r.productCategoryId === product.categoryId);

            if (productRule) {
                finalSalePrice *= (1 - productRule.discountPercentage / 100);
            } else if (categoryRule) {
                finalSalePrice *= (1 - categoryRule.discountPercentage / 100);
            } else {
                finalSalePrice *= client.priceModifier;
            }
            
            const lineTotal = consumption.quantity * finalSalePrice;
            clientReport.materialsSubtotal += lineTotal;

            const existingBilledItem = clientReport.billedConsumption.find(item => item.productId === product.id);
            if (existingBilledItem) {
                existingBilledItem.totalQuantity += consumption.quantity;
                existingBilledItem.totalLine += lineTotal;
            } else {
                clientReport.billedConsumption.push({
                    productId: product.id,
                    productName: product.name,
                    unit: product.unit,
                    totalQuantity: consumption.quantity,
                    salePrice: finalSalePrice,
                    totalLine: lineTotal,
                });
            }
        }
        
        clientReport.totalToInvoice += clientReport.materialsSubtotal;
        report.summary.totalMaterials += clientReport.materialsSubtotal;
        report.byClient.push(clientReport);
    }
    
    report.summary.totalToInvoice = report.summary.totalFees + report.summary.totalMaterials;

    return report;
};