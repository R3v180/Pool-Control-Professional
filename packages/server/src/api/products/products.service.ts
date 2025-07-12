// filename: packages/server/src/api/products/products.service.ts
// version: 1.0.0
// description: Servicio para la lógica de negocio del catálogo de productos.

import { PrismaClient } from '@prisma/client';
import type { Product } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) para la creación y actualización ---
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'consumptions'>;
export type UpdateProductInput = Partial<CreateProductInput>;

/**
 * Crea un nuevo producto para un tenant específico.
 * @param data - Los datos del producto a crear.
 * @returns El producto recién creado.
 */
export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  return prisma.product.create({
    data,
  });
};

/**
 * Obtiene todos los productos de un tenant específico.
 * @param tenantId - El ID del tenant.
 * @returns Un array con todos los productos del tenant, ordenados por nombre.
 */
export const getProductsByTenant = async (tenantId: string): Promise<Product[]> => {
  return prisma.product.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
};

/**
 * Actualiza un producto existente.
 * @param id - El ID del producto a actualizar.
 * @param data - Los datos a modificar.
 * @returns El producto actualizado.
 */
export const updateProduct = async (id: string, data: UpdateProductInput): Promise<Product> => {
  // TODO: Añadir una verificación para asegurar que el producto pertenece al tenant del usuario que realiza la acción.
  return prisma.product.update({
    where: { id },
    data,
  });
};

/**
 * Elimina un producto.
 * La operación fallará si el producto ya ha sido usado en algún registro de consumo,
 * gracias a la restricción 'onDelete: Restrict' en el schema.
 * @param id - El ID del producto a eliminar.
 * @returns El producto que fue eliminado.
 */
export const deleteProduct = async (id: string): Promise<Product> => {
  // TODO: Añadir una verificación para asegurar que el producto pertenece al tenant del usuario que realiza la acción.
  return prisma.product.delete({
    where: { id },
  });
};