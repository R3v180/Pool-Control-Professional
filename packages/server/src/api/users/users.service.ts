// filename: packages/server/src/api/users/users.service.ts
// version: 2.4.0 (FEAT: Include availabilities in technician list)
// description: Se modifica el servicio para que, al obtener la lista de técnicos, se incluyan sus periodos de ausencia (`availabilities`). Esto es fundamental para poder visualizarlos en el Planning Hub.

import { PrismaClient } from '@prisma/client';
import type { User, UserAvailability } from '@prisma/client';

const prisma = new PrismaClient();

export type SetUserAvailabilityInput = {
  userId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  reason?: string;
};

/**
 * Obtiene todos los usuarios a los que se les puede asignar trabajo (Técnicos y Gerentes),
 * incluyendo sus ausencias planificadas.
 * @param tenantId - El ID del tenant.
 * @returns Un array de objetos de usuario, cada uno con su lista de ausencias.
 */
export const getAssignableUsersByTenant = async (
  tenantId: string
): Promise<(User & { availabilities: UserAvailability[] })[]> => {
  // ✅ Se modifica la consulta para incluir la relación 'availabilities'
  const users = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: ['TECHNICIAN', 'MANAGER'] },
    },
    include: {
      availabilities: true, // Incluimos los periodos de ausencia
    },
    orderBy: {
      name: 'asc',
    },
  });

  // ✅ Ya no mapeamos a 'title', devolvemos el objeto completo para que el frontend tenga toda la información
  return users;
};

/**
 * Actualiza el estado de disponibilidad inmediata de un usuario.
 */
export const updateUserAvailability = async (
  userId: string,
  tenantId: string,
  isAvailable: boolean
): Promise<User> => {
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
export const getAvailabilitiesForUser = async (userId: string, tenantId: string): Promise<UserAvailability[]> => {
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
export const setUserAvailability = async (data: SetUserAvailabilityInput): Promise<UserAvailability> => {
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