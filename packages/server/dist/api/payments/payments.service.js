// filename: packages/server/src/api/payments/payments.service.ts
// version: 1.0.0
// description: Servicio para la lógica de negocio de los pagos de clientes.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Crea un nuevo registro de pago.
 * @param data - Los datos del pago a crear.
 * @returns El pago recién creado.
 */
export const createPayment = async (data) => {
    return prisma.payment.create({
        data,
    });
};
/**
 * Obtiene todos los pagos de un cliente específico.
 * @param clientId - El ID del cliente.
 * @returns Un array con todos los pagos del cliente.
 */
export const getPaymentsByClient = async (clientId) => {
    return prisma.payment.findMany({
        where: { clientId },
        orderBy: { paymentDate: 'desc' },
    });
};
/**
 * Elimina un registro de pago.
 * @param id - El ID del pago a eliminar.
 */
export const deletePayment = async (id) => {
    await prisma.payment.delete({
        where: { id },
    });
};
