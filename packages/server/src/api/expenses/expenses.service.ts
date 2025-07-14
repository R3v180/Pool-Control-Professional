// filename: packages/server/src/api/expenses/expenses.service.ts
// version: 1.0.0
// description: Servicio para la lógica de negocio de los gastos de la empresa.

import { PrismaClient } from '@prisma/client';
import type { Expense } from '@prisma/client';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateExpenseInput = Omit<Expense, 'id'>;

/**
 * Crea un nuevo registro de gasto para un tenant.
 * @param data - Los datos del gasto a crear.
 * @returns El gasto recién creado.
 */
export const createExpense = async (data: CreateExpenseInput): Promise<Expense> => {
  return prisma.expense.create({
    data,
  });
};

/**
 * Obtiene todos los gastos de un tenant específico.
 * @param tenantId - El ID del tenant.
 * @returns Un array con todos los gastos del tenant.
 */
export const getExpensesByTenant = async (tenantId: string): Promise<Expense[]> => {
  return prisma.expense.findMany({
    where: { tenantId },
    orderBy: { expenseDate: 'desc' },
  });
};

/**
 * Elimina un registro de gasto.
 * @param id - El ID del gasto a eliminar.
 */
export const deleteExpense = async (id: string): Promise<void> => {
  await prisma.expense.delete({
    where: { id },
  });
};