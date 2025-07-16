// filename: packages/server/src/api/pools/pools.service.ts
// Version: 2.0.0 (FEAT: Add tenantId validation for CUD operations)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// --- Funciones del Servicio ---
/**
 * Crea una nueva piscina para un cliente y tenant específicos.
 * @param data - Datos de la nueva piscina.
 * @returns La piscina creada.
 */
export const createPool = async (data) => {
    return prisma.pool.create({
        data,
    });
};
/**
 * Actualiza una piscina existente, verificando la pertenencia al tenant.
 * @param id - El ID de la piscina a actualizar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 * @param data - Los datos a actualizar.
 * @returns La piscina actualizada.
 */
export const updatePool = async (id, tenantId, data) => {
    // Primero, verificamos que la piscina pertenece al tenant.
    // Esto es un paso extra de seguridad antes de la actualización.
    const poolExists = await prisma.pool.findFirst({
        where: { id, tenantId },
    });
    if (!poolExists) {
        throw new Error('Piscina no encontrada o sin permisos para modificar.');
    }
    return prisma.pool.update({
        where: { id },
        data,
    });
};
/**
 * Elimina una piscina, verificando la pertenencia al tenant.
 * @param id - El ID de la piscina a eliminar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 */
export const deletePool = async (id, tenantId) => {
    // Utilizamos deleteMany con una cláusula where para asegurar la pertenencia al tenant.
    const { count } = await prisma.pool.deleteMany({
        where: {
            id,
            tenantId, // <-- Condición de seguridad
        },
    });
    if (count === 0) {
        throw new Error('Piscina no encontrada o sin permisos para eliminar.');
    }
};
