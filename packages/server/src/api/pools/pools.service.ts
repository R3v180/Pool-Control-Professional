// filename: packages/server/src/api/pools/pools.service.ts
// Version: 1.0.0 (Initial creation of the service for Pool management)
import { PrismaClient } from '@prisma/client';
import type { Pool } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
// Omitimos los campos autogenerados por la base de datos (id, qrCode, timestamps)
export type CreatePoolInput = Omit<Pool, 'id' | 'qrCode' | 'createdAt' | 'updatedAt'>;
export type UpdatePoolInput = Partial<CreatePoolInput>;

// --- Funciones del Servicio ---

/**
 * Crea una nueva piscina para un cliente y tenant específicos.
 * @param data - Datos de la nueva piscina.
 * @returns La piscina creada.
 */
export const createPool = async (data: CreatePoolInput): Promise<Pool> => {
  return prisma.pool.create({
    data,
  });
};

/**
 * Actualiza una piscina existente.
 * @param id - El ID de la piscina a actualizar.
 * @param data - Los datos a actualizar.
 * @returns La piscina actualizada.
 */
export const updatePool = async (id: string, data: UpdatePoolInput): Promise<Pool> => {
  return prisma.pool.update({
    where: { id },
    data,
  });
};

/**
 * Elimina una piscina.
 * @param id - El ID de la piscina a eliminar.
 * @returns La piscina que fue eliminada.
 */
export const deletePool = async (id: string): Promise<Pool> => {
  // Al borrar la piscina, se borrarán en cascada sus visitas, etc.
  return prisma.pool.delete({
    where: { id },
  });
};