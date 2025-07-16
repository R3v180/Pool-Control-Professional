// filename: packages/server/src/api/financials/financials.service.ts
// version: 1.1.1 (FIX: Use type-only import for Prisma types)
// description: Se corrige un error de TypeScript utilizando una importación de solo tipo (`import type`) para el tipo `Payment`, cumpliendo con la regla `verbatimModuleSyntax`.

import { PrismaClient, BillingModel } from '@prisma/client';
// ✅ CORRECCIÓN: Se importa el tipo 'Payment' de forma explícita
import type { Payment } from '@prisma/client';
import { startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

// --- Interfaces de Salida ---
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
 * @param date La fecha para la que se calculará el estado (se usará el mes completo).
 * @returns Un array con el estado de cuentas de cada cliente.
 */
export const getAccountStatusByMonth = async (tenantId: string, date: Date): Promise<AccountStatus[]> => {
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);

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
    const billingDetails: AccountStatus['billingDetails'] = {
        monthlyFee: client.monthlyFee,
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
        billingDetails.materials.push({
            productName: product.name,
            quantity: consumption.quantity,
            salePrice: finalSalePrice,
            total: lineTotal,
        });
      }
    }

    const totalBilled = client.monthlyFee + billingDetails.materialsSubtotal;
    
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