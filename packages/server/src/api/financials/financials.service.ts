// filename: packages/server/src/api/financials/financials.service.ts
// version: 1.2.0 (FEAT: Support date range for account status)
// description: Se actualiza el servicio para que acepte un rango de fechas (startDate, endDate) en lugar de un solo mes, permitiendo un análisis financiero más flexible.

import { PrismaClient, BillingModel } from '@prisma/client';
import type { Payment } from '@prisma/client';
// Se elimina startOfMonth y endOfMonth que ya no son necesarios aquí
import { } from 'date-fns';

const prisma = new PrismaClient();

// --- Interfaces ---
export interface AccountStatus {
  clientId: string;
  clientName: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  billingDetails: {
      monthlyFee: number;
      materials: {
          productName: string;
          quantity: number;
          salePrice: number;
          total: number;
      }[];
      materialsSubtotal: number;
  };
  paymentDetails: Payment[];
}

/**
 * Calcula el estado de cuentas para todos los clientes en un período determinado.
 * @param tenantId El ID del tenant.
 * @param startDate La fecha de inicio del período.
 * @param endDate La fecha de fin del período.
 * @returns Un array con el estado de cuentas de cada cliente.
 */
// ✅ La función ahora acepta startDate y endDate
export const getAccountStatusByPeriod = async (tenantId: string, startDate: Date, endDate: Date): Promise<AccountStatus[]> => {

  const clients = await prisma.client.findMany({
    where: { tenantId },
    include: { clientPricingRules: true },
  });

  const [payments, consumptions] = await Promise.all([
    prisma.payment.findMany({
      where: {
        client: { tenantId },
        paymentDate: { gte: startDate, lte: endDate },
      },
    }),
    prisma.consumption.findMany({
      where: {
        visit: {
          pool: { tenantId },
          timestamp: { gte: startDate, lte: endDate },
        },
      },
      include: {
        product: true,
        visit: { include: { pool: true } },
      },
    }),
  ]);

  const results: AccountStatus[] = [];

  for (const client of clients) {
    // El cálculo del número de meses en el rango para la cuota fija
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
    const totalFees = client.monthlyFee * months;

    const billingDetails: AccountStatus['billingDetails'] = {
        monthlyFee: totalFees, // Ahora es el total de cuotas del período
        materials: [],
        materialsSubtotal: 0,
    };
    
    if (client.billingModel !== BillingModel.SERVICE_ONLY) {
      const clientConsumptions = consumptions.filter(c => c.visit.pool.clientId === client.id);

      for (const consumption of clientConsumptions) {
        const product = consumption.product;
        let finalSalePrice = product.salePrice;

        if (client.billingModel !== BillingModel.ALL_INCLUSIVE) {
            const productRule = client.clientPricingRules.find(r => r.productId === product.id);
            const categoryRule = client.clientPricingRules.find(r => r.productCategoryId === product.categoryId);
            if (productRule) finalSalePrice *= (1 - productRule.discountPercentage / 100);
            else if (categoryRule) finalSalePrice *= (1 - categoryRule.discountPercentage / 100);
            else finalSalePrice *= client.priceModifier;
        }
        
        const lineTotal = consumption.quantity * finalSalePrice;
        billingDetails.materialsSubtotal += lineTotal;
        
        // Agrupar materiales para el desglose
        const existingMaterial = billingDetails.materials.find(m => m.productName === product.name);
        if (existingMaterial) {
            existingMaterial.quantity += consumption.quantity;
            existingMaterial.total += lineTotal;
        } else {
             billingDetails.materials.push({
                productName: product.name,
                quantity: consumption.quantity,
                salePrice: finalSalePrice,
                total: lineTotal,
            });
        }
      }
    }

    const totalBilled = totalFees + billingDetails.materialsSubtotal;
    
    const clientPayments = payments.filter(p => p.clientId === client.id);
    const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);

    results.push({
      clientId: client.id,
      clientName: client.name,
      totalBilled: parseFloat(totalBilled.toFixed(2)),
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      balance: parseFloat((totalPaid - totalBilled).toFixed(2)),
      billingDetails,
      paymentDetails: clientPayments,
    });
  }

  return results.sort((a, b) => a.clientName.localeCompare(b.clientName));
};