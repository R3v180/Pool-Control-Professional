// filename: packages/server/src/api/reports/reports.service.ts
// version: 1.1.1 (FIX: Remove unused imports)

import { PrismaClient } from '@prisma/client';
// ✅ CAMBIO: Se elimina la importación de 'format' y 'es' que no se usaban.

const prisma = new PrismaClient();

// --- Tipos de Datos ---

interface ReportFilters {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  clientId?: string;
}

interface ConsumptionReport {
  summary: {
    totalCost: number;
    totalVisits: number;
    totalConsumptionRecords: number;
    startDate: string;
    endDate: string;
  };
  byClient: {
    clientId: string;
    clientName: string;
    totalClientCost: number;
    visitCount: number;
    detailedConsumption: {
      productId: string;
      productName:string;
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


export const generateConsumptionReport = async (filters: ReportFilters): Promise<ConsumptionReport> => {
  const { tenantId, startDate, endDate, clientId } = filters;

  const whereClause: any = {
    visit: {
      pool: {
        tenantId: tenantId,
      },
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
  };

  if (clientId) {
    whereClause.visit.pool.clientId = clientId;
  }

  const consumptions = await prisma.consumption.findMany({
    where: whereClause,
    include: {
      product: true,
      visit: {
        include: {
          pool: {
            include: {
              client: true,
            },
          },
        },
      },
    },
  });
  
  const reportData: Record<string, any> = {};
  let overallTotalCost = 0;
  const visitedVisits = new Set<string>();

  for (const consumption of consumptions) {
    if (!consumption.visit || !consumption.visit.pool || !consumption.visit.pool.client) {
      continue;
    }
    
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
    
    if (!reportData[client.id].detailedConsumption[product.id]) {
      reportData[client.id].detailedConsumption[product.id] = {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        totalQuantity: 0,
        totalCost: 0,
      };
    }
    
    reportData[client.id].detailedConsumption[product.id].totalQuantity += consumption.quantity;
    reportData[client.id].detailedConsumption[product.id].totalCost += itemCost;
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
      totalConsumptionRecords: consumptions.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    byClient: byClientArray,
  };
};

export const getConsumptionDetailsForProduct = async (filters: DetailFilters): Promise<ProductConsumptionDetail[]> => {
    const { tenantId, startDate, endDate, clientId, productId } = filters;

    const consumptions = await prisma.consumption.findMany({
        where: {
            productId: productId,
            visit: {
                pool: {
                    clientId: clientId,
                    tenantId: tenantId,
                },
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                }
            }
        },
        include: {
            product: true,
            visit: {
                include: {
                    technician: {
                        select: {
                            name: true,
                        }
                    }
                }
            }
        },
        orderBy: {
            visit: {
                timestamp: 'desc'
            }
        }
    });

    return consumptions.map(c => ({
        visitId: c.visitId,
        visitDate: c.visit.timestamp,
        quantity: c.quantity,
        cost: c.quantity * c.product.cost,
        technicianName: c.visit.technician?.name ?? 'No asignado',
    }));
};