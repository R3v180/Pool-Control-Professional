// filename: packages/server/src/api/users/users.service.ts
// Version: 1.0.0 (Initial creation of the service for User queries)
import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

// --- Funciones del Servicio ---

/**
 * Obtiene todos los usuarios con el rol de TECHNICIAN para un tenant específico.
 * @param tenantId - El ID del tenant.
 * @returns Un array de usuarios técnicos (sin la contraseña).
 */
export const getTechniciansByTenant = async (
  tenantId: string
): Promise<Omit<User, 'password'>[]> => {
  return prisma.user.findMany({
    where: {
      tenantId,
      role: 'TECHNICIAN',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};