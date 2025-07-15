// filename: packages/server/src/api/product-categories/product-categories.service.ts
// version: 2.0.0 (FEAT: Add tenantId validation for CUD operations)

import { PrismaClient } from '@prisma/client';
import type { ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateProductCategoryInput = {
  name: string;
  tenantId: string;
};

export type UpdateProductCategoryInput = Partial<Omit<CreateProductCategoryInput, 'tenantId'>>;

/**
 * Crea una nueva categoría de producto para un tenant.
 * @param data - Los datos de la categoría a crear.
 * @returns La categoría recién creada.
 */
export const createProductCategory = async (data: CreateProductCategoryInput): Promise<ProductCategory> => {
  return prisma.productCategory.create({
    data,
  });
};

/**
 * Obtiene todas las categorías de productos de un tenant.
 * @param tenantId - El ID del tenant.
 * @returns Un array con todas las categorías, ordenadas por nombre.
 */
export const getProductCategoriesByTenant = async (tenantId: string): Promise<ProductCategory[]> => {
  return prisma.productCategory.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
};

/**
 * Actualiza una categoría de producto existente, verificando la pertenencia al tenant.
 * @param id - El ID de la categoría a actualizar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 * @param data - Los datos a modificar.
 * @returns La categoría actualizada.
 */
export const updateProductCategory = async (id: string, tenantId: string, data: UpdateProductCategoryInput): Promise<ProductCategory> => {
  const { count } = await prisma.productCategory.updateMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
    data,
  });

  if (count === 0) {
    throw new Error('Categoría no encontrada o sin permisos para modificar.');
  }

  return prisma.productCategory.findUniqueOrThrow({ where: { id } });
};

/**
 * Elimina una categoría de producto, verificando la pertenencia al tenant.
 * @param id - El ID de la categoría a eliminar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 */
export const deleteProductCategory = async (id: string, tenantId: string): Promise<void> => {
  const { count } = await prisma.productCategory.deleteMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
  });

  if (count === 0) {
    throw new Error('Categoría no encontrada o sin permisos para eliminar.');
  }
};