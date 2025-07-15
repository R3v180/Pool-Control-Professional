// filename: packages/server/src/api/users/users.service.ts
// Version: 2.2.0 (FEAT: Add updateUserAvailability function)
// description: Adds logic to update a user's availability status.

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
      isAvailable: true, 
    },
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Actualiza el estado de disponibilidad de un usuario.
 * @param userId - El ID del usuario a actualizar.
 * @param tenantId - El ID del tenant para validación.
 * @param isAvailable - El nuevo estado de disponibilidad.
 * @returns El objeto del usuario actualizado.
 */
export const updateUserAvailability = async (
  userId: string,
  tenantId: string,
  isAvailable: boolean
): Promise<User> => {
  // Se usa updateMany para asegurar que solo se actualice si el usuario
  // pertenece al tenant correcto, evitando la modificación de datos ajenos.
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

  // Devolvemos el usuario actualizado completo para la respuesta de la API.
  return prisma.user.findUniqueOrThrow({ where: { id: userId } });
};