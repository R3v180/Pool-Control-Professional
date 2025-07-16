// filename: packages/server/src/api/pool-configurations/pool-configurations.service.ts
// version: 2.0.3 (FIXED)
// description: Se importan y utilizan los tipos Enum de Prisma para 'frequency', solucionando los errores de tipo.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Crea una nueva configuración de mantenimiento para una piscina.
 */
export const createPoolConfiguration = async (data) => {
    if (data.parameterTemplateId && data.taskTemplateId) {
        throw new Error('Una configuración solo puede estar asociada a un parámetro O a una tarea, no a ambos.');
    }
    if (!data.parameterTemplateId && !data.taskTemplateId) {
        throw new Error('La configuración debe estar asociada a un parámetro o a una tarea.');
    }
    return prisma.poolConfiguration.create({
        data,
    });
};
/**
 * Obtiene todas las configuraciones para una piscina específica.
 */
export const getConfigurationsByPool = async (poolId) => {
    return prisma.poolConfiguration.findMany({
        where: { poolId },
        include: {
            parameterTemplate: true,
            taskTemplate: true,
        },
    });
};
/**
 * Actualiza una configuración de mantenimiento existente, verificando la pertenencia al tenant.
 */
export const updatePoolConfiguration = async (id, tenantId, data) => {
    const { count } = await prisma.poolConfiguration.updateMany({
        where: {
            id,
            pool: {
                tenantId: tenantId,
            },
        },
        data,
    });
    if (count === 0) {
        throw new Error('Configuración no encontrada o sin permisos para modificar.');
    }
    return prisma.poolConfiguration.findUniqueOrThrow({ where: { id } });
};
/**
 * Elimina una configuración de mantenimiento de una piscina, verificando la pertenencia al tenant.
 */
export const deletePoolConfiguration = async (id, tenantId) => {
    const { count } = await prisma.poolConfiguration.deleteMany({
        where: {
            id,
            pool: {
                tenantId: tenantId,
            },
        },
    });
    if (count === 0) {
        throw new Error('Configuración no encontrada o sin permisos para eliminar.');
    }
};
