// filename: packages/server/src/api/tasks/tasks.service.ts
// Version: 2.0.0 (FEAT: Add tenantId validation for CUD operations)

import { PrismaClient } from '@prisma/client';
import type { ScheduledTaskTemplate } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateTaskTemplateInput = {
  name: string;
  tenantId: string; // Cada plantilla pertenece a un tenant
  description?: string;
};

export type UpdateTaskTemplateInput = Partial<Omit<CreateTaskTemplateInput, 'tenantId'>>;

// --- Funciones del Servicio ---

/**
 * Crea una nueva plantilla de tarea para un tenant específico.
 * @param input - Datos de la nueva plantilla.
 * @returns La plantilla de tarea creada.
 */
export const createTaskTemplate = async (
  input: CreateTaskTemplateInput
): Promise<ScheduledTaskTemplate> => {
  return prisma.scheduledTaskTemplate.create({
    data: input,
  });
};

/**
 * Obtiene todas las plantillas de tareas para un tenant específico.
 * @param tenantId - El ID del tenant.
 * @returns Un array de plantillas de tareas.
 */
export const getTaskTemplatesByTenant = async (
  tenantId: string
): Promise<ScheduledTaskTemplate[]> => {
  return prisma.scheduledTaskTemplate.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
};

/**
 * Actualiza una plantilla de tarea existente, verificando la pertenencia al tenant.
 * @param id - El ID de la plantilla a actualizar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 * @param data - Los datos a actualizar.
 * @returns La plantilla de tarea actualizada.
 */
export const updateTaskTemplate = async (
  id: string,
  tenantId: string,
  data: UpdateTaskTemplateInput
): Promise<ScheduledTaskTemplate> => {
  const { count } = await prisma.scheduledTaskTemplate.updateMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
    data,
  });

  if (count === 0) {
    throw new Error('Plantilla de tarea no encontrada o sin permisos para modificar.');
  }

  return prisma.scheduledTaskTemplate.findUniqueOrThrow({ where: { id } });
};

/**
 * Elimina una plantilla de tarea, verificando la pertenencia al tenant.
 * @param id - El ID de la plantilla a eliminar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 */
export const deleteTaskTemplate = async (
  id: string,
  tenantId: string,
): Promise<void> => {
  // TODO: Añadir lógica para verificar que esta plantilla no está siendo
  // usada en ninguna PoolConfiguration antes de permitir el borrado.
  const { count } = await prisma.scheduledTaskTemplate.deleteMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
  });

  if (count === 0) {
    throw new Error('Plantilla de tarea no encontrada o sin permisos para eliminar.');
  }
};