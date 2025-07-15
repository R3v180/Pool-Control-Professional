// filename: packages/server/src/api/parameters/parameters.service.ts
// Version: 2.0.1 (FIXED: Correct type definition for create operation)

import { PrismaClient } from '@prisma/client';
import type { ParameterTemplate, InputType } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateParameterTemplateInput = {
  name: string;
  tenantId: string; // Cada plantilla pertenece a un tenant
  unit?: string;
  type: InputType; // <-- CORREGIDO: Se ha eliminado el '?' para hacerlo obligatorio.
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
 * Actualiza una plantilla de parámetro existente, verificando la pertenencia al tenant.
 * @param id - El ID de la plantilla a actualizar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 * @param data - Los datos a actualizar.
 * @returns La plantilla de parámetro actualizada.
 */
export const updateParameterTemplate = async (
  id: string,
  tenantId: string,
  data: UpdateParameterTemplateInput
): Promise<ParameterTemplate> => {
  const { count } = await prisma.parameterTemplate.updateMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
    data,
  });

  if (count === 0) {
    throw new Error('Plantilla de parámetro no encontrada o sin permisos para modificar.');
  }

  return prisma.parameterTemplate.findUniqueOrThrow({ where: { id } });
};

/**
 * Elimina una plantilla de parámetro, verificando la pertenencia al tenant.
 * @param id - El ID de la plantilla a eliminar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 */
export const deleteParameterTemplate = async (
  id: string,
  tenantId: string
): Promise<void> => {
  const { count } = await prisma.parameterTemplate.deleteMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
  });

  if (count === 0) {
    throw new Error('Plantilla de parámetro no encontrada o sin permisos para eliminar.');
  }
};