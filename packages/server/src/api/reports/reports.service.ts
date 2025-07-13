// filename: packages/server/src/api/reports/reports.service.ts
// version: 1.0.0
// description: Servicio para generar informes de consumo y rentabilidad.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Datos ---

// Define los filtros que la función aceptará
interface ReportFilters {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  clientId?: string;
}

// Define la estructura de la respuesta que generará este servicio
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


/**
 * Genera un informe detallado de consumo de productos y costes.
 * @param filters - Objeto con tenantId, startDate, endDate y opcionalmente clientId.
 * @returns Un objeto con el informe de consumo detallado.
 */
export const generateConsumptionReport = async (filters: ReportFilters): Promise<ConsumptionReport> => {
  const { tenantId, startDate, endDate, clientId } = filters;

  // 1. Construir la cláusula 'where' para la consulta de Prisma
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

  // Si se especifica un cliente, se añade al filtro
  if (clientId) {
    whereClause.visit.pool.clientId = clientId;
  }

  // 2. Obtener todos los registros de consumo que cumplen con los filtros
  const consumptions = await prisma.consumption.findMany({
    where: whereClause,
    include: {
      product: true, // Para obtener el coste, nombre y unidad del producto
      visit: {
        include: {
          pool: {
            include: {
              client: true, // Para obtener el nombre y ID del cliente
            },
          },
        },
      },
    },
  });
  
  // 3. Procesar los datos en memoria para agregarlos y calcular totales
  const reportData: Record<string, any> = {};
  let overallTotalCost = 0;
  const visitedVisits = new Set<string>();

  for (const consumption of consumptions) {
    // Si el consumo, por alguna razón, no tiene visita o cliente, se omite
    if (!consumption.visit || !consumption.visit.pool || !consumption.visit.pool.client) {
      continue;
    }
    
    const client = consumption.visit.pool.client;
    const product = consumption.product;
    const itemCost = consumption.quantity * product.cost;

    overallTotalCost += itemCost;
    visitedVisits.add(consumption.visitId);

    // Inicializar la entrada para el cliente si no existe
    if (!reportData[client.id]) {
      reportData[client.id] = {
        clientId: client.id,
        clientName: client.name,
        totalClientCost: 0,
        visitCount: new Set<string>(),
        detailedConsumption: {},
      };
    }
    
    // Agregar datos al cliente
    reportData[client.id].totalClientCost += itemCost;
    reportData[client.id].visitCount.add(consumption.visitId);
    
    // Inicializar la entrada para el producto si no existe para ese cliente
    if (!reportData[client.id].detailedConsumption[product.id]) {
      reportData[client.id].detailedConsumption[product.id] = {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        totalQuantity: 0,
        totalCost: 0,
      };
    }
    
    // Agregar datos al producto consumido por ese cliente
    reportData[client.id].detailedConsumption[product.id].totalQuantity += consumption.quantity;
    reportData[client.id].detailedConsumption[product.id].totalCost += itemCost;
  }
  
  // 4. Formatear la salida final para que coincida con la estructura deseada
  const byClientArray = Object.values(reportData).map(clientData => ({
    ...clientData,
    visitCount: clientData.visitCount.size, // Convertir el Set a un número
    detailedConsumption: Object.values(clientData.detailedConsumption), // Convertir el objeto a un array
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