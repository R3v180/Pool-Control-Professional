// filename: packages/server/src/api/users/users.service.ts
// version: 2.3.1 (FEAT: Format users as FullCalendar resources)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Obtiene todos los usuarios a los que se les puede asignar trabajo (Técnicos y Gerentes),
 * formateados como recursos para FullCalendar.
 * @param tenantId - El ID del tenant.
 * @returns Un array de usuarios formateados.
 */
export const getAssignableUsersByTenant = async (tenantId) => {
    const users = await prisma.user.findMany({
        where: {
            tenantId,
            role: { in: ['TECHNICIAN', 'MANAGER'] },
            // Solo incluimos técnicos que no estén marcados como permanentemente inactivos
            isAvailable: true,
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: 'asc',
        },
    });
    // Mapeamos al formato que FullCalendar espera para los 'resources'
    return users.map(user => ({
        id: user.id,
        title: user.name, // FullCalendar usa 'title' para mostrar el nombre en la fila
    }));
};
/**
 * Actualiza el estado de disponibilidad inmediata de un usuario.
 */
export const updateUserAvailability = async (userId, tenantId, isAvailable) => {
    const { count } = await prisma.user.updateMany({
        where: {
            id: userId,
            tenantId: tenantId,
        },
        data: {
            isAvailable: isAvailable,
        },
    });
    if (count === 0) {
        throw new Error('Usuario no encontrado o sin permisos para modificar.');
    }
    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
};
/**
 * Obtiene todos los registros de ausencia para un usuario específico.
 */
export const getAvailabilitiesForUser = async (userId, tenantId) => {
    return prisma.userAvailability.findMany({
        where: {
            userId,
            tenantId,
        },
        orderBy: {
            startDate: 'desc',
        },
    });
};
/**
 * Crea un nuevo registro de ausencia planificada para un usuario.
 */
export const setUserAvailability = async (data) => {
    return prisma.userAvailability.create({
        data: {
            userId: data.userId,
            tenantId: data.tenantId,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            reason: data.reason,
        },
    });
};
