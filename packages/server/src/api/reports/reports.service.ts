// filename: packages/server/src/api/reports/reports.service.ts
// version: 1.2.1 (FIXED)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Datos (Existentes) ---

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


// --- Nueva Interfaz para el Informe de Facturación ---

export interface InvoicingReport {
  summary: {
    totalToInvoice: number;
    totalFees: number;
    totalMaterials: number;
    startDate: string;
    endDate: string;
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
      salePrice: number; // Precio de venta unitario aplicado
      totalLine: number;
    }[];
  }[];
}


// --- Funciones de Servicio (Existentes) ---

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


// --- ✅ NUEVA FUNCIÓN DE SERVICIO ---
export const generateInvoicingReport = async (filters: ReportFilters): Promise<InvoicingReport> => {
    const { tenantId, startDate, endDate, clientId } = filters;

    // 1. Obtener los clientes relevantes y sus reglas de precios
    const clients = await prisma.client.findMany({
        where: {
            tenantId,
            id: clientId ? clientId : undefined,
        },
        // --- CAMBIO APLICADO ---
        // Al no usar 'select', Prisma incluirá todos los campos escalares por defecto,
        // además de la relación especificada en 'include'. Esto soluciona el error de tipado.
        include: {
            pricingRules: true,
        },
    });

    // 2. Obtener todos los consumos del periodo para los clientes filtrados
    const consumptions = await prisma.consumption.findMany({
        where: {
            visit: {
                pool: {
                    tenantId: tenantId,
                    clientId: clientId ? clientId : undefined,
                },
                timestamp: { gte: startDate, lte: endDate },
            },
        },
        include: {
            product: true,
            visit: { include: { pool: { include: { client: true } } } },
        },
    });

    const report: InvoicingReport = {
        summary: { totalToInvoice: 0, totalFees: 0, totalMaterials: 0, startDate: startDate.toISOString(), endDate: endDate.toISOString() },
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
            continue; // No se facturan materiales, pasar al siguiente cliente
        }

        const clientConsumptions = consumptions.filter(c => c.visit.pool.clientId === client.id);

        for (const consumption of clientConsumptions) {
            const product = consumption.product;
            let finalSalePrice = product.salePrice;

            // Aplicar jerarquía de precios
            const productRule = client.pricingRules.find(r => r.productId === product.id);
            const categoryRule = client.pricingRules.find(r => r.productCategoryId === product.categoryId);

            if (productRule) { // 1. Descuento específico de producto
                finalSalePrice *= (1 - productRule.discountPercentage / 100);
            } else if (categoryRule) { // 2. Descuento de categoría
                finalSalePrice *= (1 - categoryRule.discountPercentage / 100);
            } else { // 3. Modificador general del cliente
                finalSalePrice *= client.priceModifier;
            }
            
            const lineTotal = consumption.quantity * finalSalePrice;
            clientReport.materialsSubtotal += lineTotal;

            // Agregar al detalle de consumo facturado
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
        report.summary.totalToInvoice += clientReport.totalToInvoice;
        report.byClient.push(clientReport);
    }

    return report;
};