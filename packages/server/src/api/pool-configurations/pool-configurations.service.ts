// filename: packages/server/src/api/pool-configurations/pool-configurations.service.ts
// Version: 1.1.0 (Add update functionality)
import { PrismaClient } from '@prisma/client';
import type { PoolConfiguration, Frequency } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreatePoolConfigurationInput = {
  poolId: string;
  frequency: Frequency;
  minThreshold?: number;
  maxThreshold?: number;
  parameterTemplateId?: string;
  taskTemplateId?: string;
};

export type UpdatePoolConfigurationInput = Partial<Omit<CreatePoolConfigurationInput, 'poolId' | 'parameterTemplateId' | 'taskTemplateId'>>;


// --- Funciones del Servicio ---

/**
 * Crea una nueva configuración de mantenimiento para una piscina.
 */
export const createPoolConfiguration = async (
  data: CreatePoolConfigurationInput
): Promise<PoolConfiguration> => {
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
export const getConfigurationsByPool = async (poolId: string): Promise<PoolConfiguration[]> => {
  return prisma.poolConfiguration.findMany({
    where: { poolId },
    include: {
      parameterTemplate: true,
      taskTemplate: true,
    },
  });
};

/**
 * Actualiza una configuración de mantenimiento existente.
 * @param id - El ID de la configuración a actualizar.
 * @param data - Los datos a actualizar.
 * @returns La configuración actualizada.
 */
export const updatePoolConfiguration = async (
  id: string,
  data: UpdatePoolConfigurationInput
): Promise<PoolConfiguration> => {
  return prisma.poolConfiguration.update({
    where: { id },
    data,
  });
};


/**
 * Elimina una configuración de mantenimiento de una piscina.
 */
export const deletePoolConfiguration = async (id: string): Promise<PoolConfiguration> => {
  return prisma.poolConfiguration.delete({
    where: { id },
  });
};