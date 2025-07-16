// filename: packages/server/src/api/products/products.service.ts
// version: 2.0.0 (FEAT: Add tenantId validation for CUD operations)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Crea un nuevo producto para un tenant específico.
 * @param data - Los datos del producto a crear.
 * @returns El producto recién creado.
 */
export const createProduct = async (data) => {
    return prisma.product.create({
        data,
    });
};
/**
 * Obtiene todos los productos de un tenant específico.
 * @param tenantId - El ID del tenant.
 * @returns Un array con todos los productos del tenant, ordenados por nombre.
 */
export const getProductsByTenant = async (tenantId) => {
    return prisma.product.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
    });
};
/**
 * Actualiza un producto existente, verificando la pertenencia al tenant.
 * @param id - El ID del producto a actualizar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 * @param data - Los datos a modificar.
 * @returns El producto actualizado.
 */
export const updateProduct = async (id, tenantId, data) => {
    const { count } = await prisma.product.updateMany({
        where: {
            id,
            tenantId, // <-- La condición de seguridad clave
        },
        data,
    });
    if (count === 0) {
        throw new Error('Producto no encontrado o sin permisos para modificar.');
    }
    // Devolvemos el producto actualizado para mantener la consistencia de la API
    return prisma.product.findUniqueOrThrow({ where: { id } });
};
/**
 * Elimina un producto, verificando la pertenencia al tenant.
 * La operación fallará si el producto ya ha sido usado en algún registro de consumo.
 * @param id - El ID del producto a eliminar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 */
export const deleteProduct = async (id, tenantId) => {
    const { count } = await prisma.product.deleteMany({
        where: {
            id,
            tenantId, // <-- La condición de seguridad clave
        },
    });
    if (count === 0) {
        throw new Error('Producto no encontrado o sin permisos para eliminar.');
    }
};
