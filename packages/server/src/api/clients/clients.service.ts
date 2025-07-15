// filename: packages/server/src/api/clients/clients.service.ts
// Version: 2.0.0 (FEAT: Add tenantId validation for CUD operations)

import { PrismaClient } from '@prisma/client';
import type { Client } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClientInput = Partial<Omit<CreateClientInput, 'tenantId' | 'createdAt' | 'updatedAt'>>;

// --- Funciones del Servicio ---

/**
 * Crea un nuevo cliente para un tenant específico.
 * @param data - Datos del nuevo cliente.
 * @returns El cliente creado.
 */
export const createClient = async (data: CreateClientInput): Promise<Client> => {
  return prisma.client.create({
    data,
  });
};

/**
 * Obtiene todos los clientes de un tenant específico.
 * @param tenantId - El ID del tenant.
 * @returns Un array de clientes.
 */
export const getClientsByTenant = async (tenantId: string): Promise<Client[]> => {
  return prisma.client.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
    include: {
      pools: true,
    },
  });
};

/**
 * Obtiene un cliente específico por su ID.
 * @param id - El ID del cliente a buscar.
 * @param tenantId - El ID del tenant para asegurar la pertenencia.
 * @returns El objeto del cliente o null si no se encuentra o no pertenece al tenant.
 */
export const getClientById = async (id: string, tenantId: string): Promise<Client | null> => {
  return prisma.client.findFirst({
    where: { id, tenantId },
     include: {
      pools: true,
    },
  });
};


/**
 * Actualiza un cliente existente, verificando la pertenencia al tenant.
 * @param id - El ID del cliente a actualizar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 * @param data - Los datos a actualizar.
 * @returns El cliente actualizado.
 */
export const updateClient = async (id: string, tenantId: string, data: UpdateClientInput): Promise<Client> => {
  const { count } = await prisma.client.updateMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
    data,
  });

  if (count === 0) {
    throw new Error('Cliente no encontrado o sin permisos para modificar.');
  }

  return prisma.client.findUniqueOrThrow({ where: { id } });
};

/**
 * Elimina un cliente, verificando la pertenencia al tenant.
 * @param id - El ID del cliente a eliminar.
 * @param tenantId - El ID del tenant del usuario que realiza la acción.
 */
export const deleteClient = async (id: string, tenantId: string): Promise<void> => {
  const { count } = await prisma.client.deleteMany({
    where: {
      id,
      tenantId, // <-- Condición de seguridad
    },
  });

  if (count === 0) {
    throw new Error('Cliente no encontrado o sin permisos para eliminar.');
  }
};