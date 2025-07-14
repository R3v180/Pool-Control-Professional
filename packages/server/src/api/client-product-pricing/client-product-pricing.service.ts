// filename: packages/server/src/api/client-product-pricing/client-product-pricing.service.ts
// version: 1.0.0
// description: Servicio para la lógica de negocio de las reglas de precios.

import { PrismaClient } from '@prisma/client';
import type { ClientProductPricing } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreatePricingRuleInput = {
  clientId: string;
  discountPercentage: number;
  productId?: string;
  productCategoryId?: string;
};

export type UpdatePricingRuleInput = {
  discountPercentage: number;
};

/**
 * Crea una nueva regla de precios para un cliente.
 * @param data - Los datos de la regla.
 * @returns La regla recién creada.
 */
export const createPricingRule = async (data: CreatePricingRuleInput): Promise<ClientProductPricing> => {
  // La unicidad se maneja a nivel de base de datos con @@unique
  return prisma.clientProductPricing.create({
    data,
  });
};

/**
 * Obtiene todas las reglas de precios para un cliente específico.
 * @param clientId - El ID del cliente.
 * @returns Un array con todas las reglas de precios del cliente.
 */
export const getPricingRulesByClient = async (clientId: string): Promise<ClientProductPricing[]> => {
  return prisma.clientProductPricing.findMany({
    where: { clientId },
    include: {
      product: { select: { name: true } },
      productCategory: { select: { name: true } },
    },
    orderBy: {
      // Opcional: algún orden lógico si se desea
      product: { name: 'asc' },
    },
  });
};

/**
 * Actualiza una regla de precios existente.
 * @param id - El ID de la regla a actualizar.
 * @param data - Los datos a modificar (solo el descuento).
 * @returns La regla actualizada.
 */
export const updatePricingRule = async (id: string, data: UpdatePricingRuleInput): Promise<ClientProductPricing> => {
  return prisma.clientProductPricing.update({
    where: { id },
    data,
  });
};

/**
 * Elimina una regla de precios.
 * @param id - El ID de la regla a eliminar.
 */
export const deletePricingRule = async (id: string): Promise<void> => {
  await prisma.clientProductPricing.delete({
    where: { id },
  });
};