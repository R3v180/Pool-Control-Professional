// filename: packages/server/src/api/payments/payments.service.ts
// version: 1.0.0
// description: Servicio para la lógica de negocio de los pagos de clientes.

import { PrismaClient } from '@prisma/client';
import type { Payment } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreatePaymentInput = Omit<Payment, 'id'>;

/**
 * Crea un nuevo registro de pago.
 * @param data - Los datos del pago a crear.
 * @returns El pago recién creado.
 */
export const createPayment = async (data: CreatePaymentInput): Promise<Payment> => {
  return prisma.payment.create({
    data,
  });
};

/**
 * Obtiene todos los pagos de un cliente específico.
 * @param clientId - El ID del cliente.
 * @returns Un array con todos los pagos del cliente.
 */
export const getPaymentsByClient = async (clientId: string): Promise<Payment[]> => {
  return prisma.payment.findMany({
    where: { clientId },
    orderBy: { paymentDate: 'desc' },
  });
};

/**
 * Elimina un registro de pago.
 * @param id - El ID del pago a eliminar.
 */
export const deletePayment = async (id: string): Promise<void> => {
  await prisma.payment.delete({
    where: { id },
  });
};