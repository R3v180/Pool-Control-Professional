// filename: packages/server/src/api/pool-configurations/pool-configurations.service.ts
// Version: 2.0.0 (FEAT: Add tenantId validation for CUD operations)

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

  // TODO: Añadir validación para asegurar que poolId pertenece al tenant del usuario.
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
 * Actualiza una configuración de mantenimiento existente, verificando la pertenencia al tenant.
 * @param id - El ID de la configuración a actualizar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 * @param data - Los datos a actualizar.
 * @returns La configuración actualizada.
 */
export const updatePoolConfiguration = async (
  id: string,
  tenantId: string,
  data: UpdatePoolConfigurationInput
): Promise<PoolConfiguration> => {
  const { count } = await prisma.poolConfiguration.updateMany({
    where: {
      id,
      // Verificamos la pertenencia a través de la relación con la piscina
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
 * @param id - El ID de la configuración a eliminar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 */
export const deletePoolConfiguration = async (id: string, tenantId: string): Promise<void> => {
  const { count } = await prisma.poolConfiguration.deleteMany({
    where: {
      id,
      // Verificamos la pertenencia a través de la relación con la piscina
      pool: {
        tenantId: tenantId,
      },
    },
  });

  if (count === 0) {
    throw new Error('Configuración no encontrada o sin permisos para eliminar.');
  }
};