import { PrismaClient } from '@prisma/client';
import type { Tenant, SubscriptionStatus } from '@prisma/client';
import { hashPassword } from '../../utils/password.utils.js';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
type AdminUserInput = {
  name: string;
  email: string;
  password: string;
};

export type CreateTenantInput = {
  companyName: string;
  subdomain: string;
  adminUser: AdminUserInput;
};

// --- Funciones del Servicio ---

/**
 * Crea un nuevo Tenant y su primer usuario Administrador de forma atómica.
 * @param input - Datos para el nuevo tenant y su admin.
 * @returns El objeto del Tenant recién creado.
 */
export const createTenant = async (input: CreateTenantInput): Promise<Tenant> => {
  const { companyName, subdomain, adminUser } = input;

  const newTenant = await prisma.$transaction(async (tx) => {
    const existingSubdomain = await tx.tenant.findUnique({ where: { subdomain } });
    if (existingSubdomain) {
      throw new Error('El subdominio ya está en uso.');
    }

    const existingEmail = await tx.user.findUnique({ where: { email: adminUser.email } });
    if (existingEmail) {
      throw new Error('El correo electrónico ya está en uso por otro usuario.');
    }

    const tenant = await tx.tenant.create({
      data: {
        companyName,
        subdomain,
      },
    });

    const hashedPassword = await hashPassword(adminUser.password);
    await tx.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    return tenant;
  });

  return newTenant;
};

/**
 * Obtiene un listado de todos los tenants.
 * @returns Un array de todos los tenants.
 */
export const getAllTenants = async (): Promise<Tenant[]> => {
  return prisma.tenant.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Busca un tenant específico por su ID.
 * @param id - El ID del tenant a buscar.
 * @returns El objeto del tenant o null si no se encuentra.
 */
export const getTenantById = async (id: string): Promise<Tenant | null> => {
  return prisma.tenant.findUnique({
    where: { id },
  });
};

/**
 * Actualiza el estado de la suscripción de un tenant.
 * @param id - El ID del tenant a actualizar.
 * @param status - El nuevo estado de la suscripción.
 * @returns El objeto del tenant actualizado.
 */
export const updateTenantStatus = async (
  id: string,
  status: SubscriptionStatus
): Promise<Tenant> => {
  return prisma.tenant.update({
    where: { id },
    data: {
      subscriptionStatus: status,
    },
  });
};

/**
 * Elimina un tenant y toda su información asociada (cascade).
 * @param id - El ID del tenant a eliminar.
 * @returns El objeto del tenant que fue eliminado.
 */
export const deleteTenant = async (id: string): Promise<Tenant> => {
  // Gracias a 'onDelete: Cascade' en el schema, al borrar un tenant,
  // se borrarán en cascada todos sus usuarios, clientes, piscinas, etc.
  return prisma.tenant.delete({
    where: { id },
  });
};