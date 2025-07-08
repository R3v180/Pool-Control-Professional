// filename: packages/server/src/api/parameters/parameters.service.ts
// Version: 1.0.0 (Initial creation of the service with CRUD functions)
import { PrismaClient } from '@prisma/client';
import type { ParameterTemplate, InputType } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateParameterTemplateInput = {
  name: string;
  tenantId: string; // Cada plantilla pertenece a un tenant
  unit?: string;
  type?: InputType;
  selectOptions?: string[];
};

export type UpdateParameterTemplateInput = Partial<Omit<CreateParameterTemplateInput, 'tenantId'>>;

// --- Funciones del Servicio ---

/**
 * Crea una nueva plantilla de parámetro para un tenant específico.
 * @param input - Datos de la nueva plantilla.
 * @returns La plantilla de parámetro creada.
 */
export const createParameterTemplate = async (
  input: CreateParameterTemplateInput
): Promise<ParameterTemplate> => {
  return prisma.parameterTemplate.create({
    data: input,
  });
};

/**
 * Obtiene todas las plantillas de parámetros para un tenant específico.
 * @param tenantId - El ID del tenant.
 * @returns Un array de plantillas de parámetros.
 */
export const getParameterTemplatesByTenant = async (
  tenantId: string
): Promise<ParameterTemplate[]> => {
  return prisma.parameterTemplate.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
};

/**
 * Actualiza una plantilla de parámetro existente.
 * @param id - El ID de la plantilla a actualizar.
 * @param data - Los datos a actualizar.
 * @returns La plantilla de parámetro actualizada.
 */
export const updateParameterTemplate = async (
  id: string,
  data: UpdateParameterTemplateInput
): Promise<ParameterTemplate> => {
  return prisma.parameterTemplate.update({
    where: { id },
    data,
  });
};

/**
 * Elimina una plantilla de parámetro.
 * @param id - El ID de la plantilla a eliminar.
 * @returns La plantilla de parámetro que fue eliminada.
 */
export const deleteParameterTemplate = async (
  id: string
): Promise<ParameterTemplate> => {
  // TODO: Añadir lógica para verificar que esta plantilla no está siendo
  // usada en ninguna PoolConfiguration antes de permitir el borrado.
  return prisma.parameterTemplate.delete({
    where: { id },
  });
};