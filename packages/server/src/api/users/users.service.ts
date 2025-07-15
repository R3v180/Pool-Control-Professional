// ====== [102] packages/server/src/api/users/users.service.ts ======
// filename: packages/server/src/api/users/users.service.ts
// Version: 2.1.0 (FIX: Include isAvailable field in select query)
// description: The function now includes the 'isAvailable' field to match the updated User type.

import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

// --- Funciones del Servicio ---

/**
 * Obtiene todos los usuarios a los que se les puede asignar trabajo (Técnicos y Gerentes).
 * @param tenantId - El ID del tenant.
 * @returns Un array de usuarios (sin la contraseña).
 */
export const getAssignableUsersByTenant = async (
  tenantId: string
): Promise<Omit<User, 'password'>[]> => {
  return prisma.user.findMany({
    where: {
      tenantId,
      // Se incluyen ambos roles en el filtro
      role: { in: ['TECHNICIAN', 'MANAGER'] },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
      // ✅ CORRECCIÓN: Añadir el campo que faltaba.
      isAvailable: true, 
    },
    orderBy: {
      name: 'asc',
    },
  });
};