// filename: packages/server/src/api/pool-configurations/pool-configurations.service.ts
// Version: 1.0.0 (Initial creation of the service for Pool Configurations)
import { PrismaClient } from '@prisma/client';
import type { PoolConfiguration, Frequency } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
// Tipo para crear una nueva configuración.
export type CreatePoolConfigurationInput = {
  poolId: string;
  frequency: Frequency;
  minThreshold?: number;
  maxThreshold?: number;
  parameterTemplateId?: string; // Opcional, para parámetros
  taskTemplateId?: string;      // Opcional, para tareas
};

// --- Funciones del Servicio ---

/**
 * Crea una nueva configuración de mantenimiento para una piscina.
 * @param data - Los datos de la nueva configuración.
 * @returns La configuración creada.
 */
export const createPoolConfiguration = async (
  data: CreatePoolConfigurationInput
): Promise<PoolConfiguration> => {
  // Validación para asegurar que se proporciona o un parámetro o una tarea, pero no ambos.
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
 * @param poolId - El ID de la piscina.
 * @returns Un array de configuraciones para esa piscina.
 */
export const getConfigurationsByPool = async (poolId: string): Promise<PoolConfiguration[]> => {
  return prisma.poolConfiguration.findMany({
    where: { poolId },
    // Incluimos los datos de las plantillas asociadas para mostrarlos en el frontend
    include: {
      parameterTemplate: true,
      taskTemplate: true,
    },
  });
};

/**
 * Elimina una configuración de mantenimiento de una piscina.
 * @param id - El ID de la configuración a eliminar.
 * @returns La configuración que fue eliminada.
 */
export const deletePoolConfiguration = async (id: string): Promise<PoolConfiguration> => {
  return prisma.poolConfiguration.delete({
    where: { id },
  });
};