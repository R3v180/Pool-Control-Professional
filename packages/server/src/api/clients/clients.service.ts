// filename: packages/server/src/api/clients/clients.service.ts
// Version: 1.1.1 (FIXED)
// description: Elimina la importación no utilizada de BillingModel.
import { PrismaClient } from '@prisma/client';
// --- La importación de BillingModel ha sido eliminada de aquí ---
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
    // Incluimos las piscinas asociadas a cada cliente
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
 * Actualiza un cliente existente.
 * @param id - El ID del cliente a actualizar.
 * @param data - Los datos a actualizar.
 * @returns El cliente actualizado.
 */
export const updateClient = async (id: string, data: UpdateClientInput): Promise<Client> => {
  return prisma.client.update({
    where: { id },
    data,
  });
};

/**
 * Elimina un cliente.
 * @param id - El ID del cliente a eliminar.
 * @returns El cliente que fue eliminado.
 */
export const deleteClient = async (id: string): Promise<Client> => {
  // Al borrar el cliente, se borrarán en cascada sus piscinas asociadas.
  return prisma.client.delete({
    where: { id },
  });
};