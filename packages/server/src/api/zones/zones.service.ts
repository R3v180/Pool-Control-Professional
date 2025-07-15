// filename: packages/server/src/api/zones/zones.service.ts
// version: 1.0.0
// description: Servicio para la lógica de negocio (CRUD) de las Zonas Geográficas.

import { PrismaClient } from '@prisma/client';
import type { Zone } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateZoneInput = {
  name: string;
  tenantId: string;
};

export type UpdateZoneInput = {
  name: string;
};


// --- Funciones del Servicio ---

/**
 * Crea una nueva zona para un tenant, asegurando que el nombre no esté duplicado.
 * @param data - Los datos de la zona a crear, incluyendo name y tenantId.
 * @returns La zona recién creada.
 * @throws Si ya existe una zona con el mismo nombre en el tenant.
 */
export const createZone = async (data: CreateZoneInput): Promise<Zone> => {
  // 1. Validar que no exista otra zona con el mismo nombre en el mismo tenant.
  const existingZone = await prisma.zone.findFirst({
    where: {
      name: data.name,
      tenantId: data.tenantId,
    },
  });

  if (existingZone) {
    throw new Error('Ya existe una zona con este nombre.');
  }

  // 2. Crear la zona.
  return prisma.zone.create({
    data,
  });
};

/**
 * Obtiene todas las zonas de un tenant específico, ordenadas alfabéticamente.
 * @param tenantId - El ID del tenant.
 * @returns Un array con todas las zonas del tenant.
 */
export const getZonesByTenant = async (tenantId: string): Promise<Zone[]> => {
  return prisma.zone.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
};

/**
 * Actualiza el nombre de una zona, verificando la pertenencia al tenant.
 * @param id - El ID de la zona a actualizar.
 * @param tenantId - El ID del tenant del usuario para validación.
 * @param data - Los nuevos datos para la zona (ej. el nuevo nombre).
 * @returns La zona actualizada.
 * @throws Si la zona no se encuentra o no pertenece al tenant.
 */
export const updateZone = async (id: string, tenantId: string, data: UpdateZoneInput): Promise<Zone> => {
  // Usamos una transacción para realizar la comprobación y la actualización de forma segura.
  return prisma.$transaction(async (tx) => {
    // 1. Verificar que la zona a actualizar pertenece al tenant correcto.
    const zoneToUpdate = await tx.zone.findFirst({
      where: { id, tenantId },
    });

    if (!zoneToUpdate) {
      throw new Error('Zona no encontrada o sin permisos para modificar.');
    }

    // 2. Actualizar la zona.
    return tx.zone.update({
      where: { id },
      data,
    });
  });
};

/**
 * Elimina una zona, verificando primero que no tenga piscinas asociadas.
 * @param id - El ID de la zona a eliminar.
 * @param tenantId - El ID del tenant del usuario para validación.
 * @throws Si la zona no se encuentra, no pertenece al tenant, o si aún contiene piscinas.
 */
export const deleteZone = async (id: string, tenantId: string): Promise<void> => {
  // 1. Regla de Negocio Crítica: Verificar si la zona tiene piscinas asignadas.
  const poolCount = await prisma.pool.count({
    where: {
      zoneId: id,
      tenantId: tenantId, // Aseguramos contar solo piscinas del tenant correcto.
    },
  });

  if (poolCount > 0) {
    throw new Error('No se puede eliminar la zona porque contiene piscinas. Reasígnelas primero.');
  }

  // 2. Si no hay piscinas, proceder con la eliminación segura.
  const { count } = await prisma.zone.deleteMany({
    where: {
      id,
      tenantId, // Condición de seguridad para asegurar que solo borramos en nuestro tenant.
    },
  });

  if (count === 0) {
    throw new Error('Zona no encontrada o sin permisos para eliminar.');
  }
};