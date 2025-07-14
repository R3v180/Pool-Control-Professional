// filename: packages/server/src/api/product-categories/product-categories.service.ts
// version: 1.0.0
// description: Servicio para la lógica de negocio de las categorías de productos.

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
 * Actualiza una categoría de producto existente.
 * @param id - El ID de la categoría a actualizar.
 * @param data - Los datos a modificar.
 * @returns La categoría actualizada.
 */
export const updateProductCategory = async (id: string, data: UpdateProductCategoryInput): Promise<ProductCategory> => {
  // TODO: Añadir verificación para asegurar que la categoría pertenece al tenant del usuario.
  return prisma.productCategory.update({
    where: { id },
    data,
  });
};

/**
 * Elimina una categoría de producto.
 * Gracias a `onDelete: SetNull` en la relación con Producto, los productos
 * de esta categoría no se eliminarán, sino que su `categoryId` pasará a ser `null`.
 * @param id - El ID de la categoría a eliminar.
 * @returns La categoría que fue eliminada.
 */
export const deleteProductCategory = async (id: string): Promise<ProductCategory> => {
  // TODO: Añadir verificación para asegurar que la categoría pertenece al tenant del usuario.
  return prisma.productCategory.delete({
    where: { id },
  });
};