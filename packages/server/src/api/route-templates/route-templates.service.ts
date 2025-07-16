// filename: packages/server/src/api/route-templates/route-templates.service.ts
// version: 1.0.3 (FIXED)
// description: Se importan y utilizan los tipos Enum de Prisma, solucionando los errores de tipo en la definición de SeasonInput.

import { PrismaClient } from '@prisma/client';
// ✅ CORRECCIÓN: Importar los tipos Enum necesarios
import type { RouteTemplate, DayOfWeek, VisitFrequency } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
interface SeasonInput {
  frequency: VisitFrequency; // ✅ CORRECCIÓN: Usar el tipo Enum
  startDate: Date;
  endDate: Date;
}

export interface CreateRouteTemplateInput {
  name: string;
  dayOfWeek: DayOfWeek;
  tenantId: string;
  technicianId: string;
  zoneIds: string[];
  seasons: SeasonInput[];
}

export type UpdateRouteTemplateInput = Partial<Omit<CreateRouteTemplateInput, 'tenantId'>>;

// --- Funciones del Servicio ---

/**
 * Crea una nueva Ruta Maestra y sus temporadas asociadas.
 * @param data - Los datos completos de la ruta a crear.
 * @returns La Ruta Maestra recién creada.
 */
export const createRouteTemplate = async (data: CreateRouteTemplateInput): Promise<RouteTemplate> => {
  const { name, dayOfWeek, tenantId, technicianId, zoneIds, seasons } = data;

  return prisma.routeTemplate.create({
    data: {
      name,
      dayOfWeek,
      tenantId,
      technicianId: technicianId,
      zones: {
        connect: zoneIds.map(id => ({ id })),
      },
      seasons: {
        create: seasons,
      },
    },
  });
};

/**
 * Obtiene todas las Rutas Maestras de un tenant, incluyendo sus relaciones.
 * @param tenantId - El ID del tenant.
 * @returns Un array de Rutas Maestras.
 */
export const getRouteTemplatesByTenant = async (tenantId: string): Promise<RouteTemplate[]> => {
  return prisma.routeTemplate.findMany({
    where: { tenantId },
    include: {
      technician: { select: { id: true, name: true } },
      zones: { select: { id: true, name: true } },
      seasons: true,
    },
    orderBy: { name: 'asc' },
  });
};

/**
 * Obtiene una única Ruta Maestra por su ID, verificando que pertenezca al tenant.
 * @param id - El ID de la Ruta Maestra.
 * @param tenantId - El ID del tenant para validación.
 * @returns La Ruta Maestra encontrada o null.
 */
export const getRouteTemplateById = async (id: string, tenantId: string): Promise<RouteTemplate | null> => {
    return prisma.routeTemplate.findFirst({
        where: { id, tenantId },
        include: {
            technician: { select: { id: true, name: true } },
            zones: { select: { id: true, name: true } },
            seasons: true,
        },
    });
};

/**
 * Actualiza una Ruta Maestra existente.
 * @param id - El ID de la ruta a actualizar.
 * @param tenantId - El ID del tenant para validación.
 * @param data - Los datos a actualizar.
 * @returns La Ruta Maestra actualizada.
 */
export const updateRouteTemplate = async (id: string, tenantId: string, data: UpdateRouteTemplateInput): Promise<RouteTemplate> => {
  const { name, dayOfWeek, technicianId, zoneIds, seasons } = data;

  return prisma.$transaction(async (tx) => {
    await tx.routeTemplate.findFirstOrThrow({
        where: { id, tenantId }
    });

    return tx.routeTemplate.update({
      where: { id },
      data: {
        name,
        dayOfWeek,
        technicianId,
        zones: {
          set: zoneIds ? zoneIds.map(id => ({ id })) : undefined,
        },
        seasons: seasons ? {
          deleteMany: {},
          create: seasons,
        } : undefined,
      },
    });
  });
};

/**
 * Elimina una Ruta Maestra.
 * @param id - El ID de la ruta a eliminar.
 * @param tenantId - El ID del tenant para validación.
 */
export const deleteRouteTemplate = async (id: string, tenantId: string): Promise<void> => {
  const { count } = await prisma.routeTemplate.deleteMany({
    where: {
      id,
      tenantId,
    },
  });

  if (count === 0) {
    throw new Error('Ruta Maestra no encontrada o sin permisos para eliminar.');
  }
};