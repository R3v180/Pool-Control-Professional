// filename: packages/server/src/api/tasks/tasks.service.ts
// Version: 1.0.0 (Initial creation of the service for Scheduled Tasks)
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
 * Actualiza una plantilla de tarea existente.
 * @param id - El ID de la plantilla a actualizar.
 * @param data - Los datos a actualizar.
 * @returns La plantilla de tarea actualizada.
 */
export const updateTaskTemplate = async (
  id: string,
  data: UpdateTaskTemplateInput
): Promise<ScheduledTaskTemplate> => {
  return prisma.scheduledTaskTemplate.update({
    where: { id },
    data,
  });
};

/**
 * Elimina una plantilla de tarea.
 * @param id - El ID de la plantilla a eliminar.
 * @returns La plantilla de tarea que fue eliminada.
 */
export const deleteTaskTemplate = async (
  id: string
): Promise<ScheduledTaskTemplate> => {
  // TODO: Añadir lógica para verificar que esta plantilla no está siendo
  // usada en ninguna PoolConfiguration antes de permitir el borrado.
  return prisma.scheduledTaskTemplate.delete({
    where: { id },
  });
};