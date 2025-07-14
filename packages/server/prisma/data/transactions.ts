// filename: packages/server/prisma/data/transactions.ts
// version: 1.0.0
// description: Datos de semilla para pagos de clientes y gastos de la empresa.

import { subMonths, subDays } from 'date-fns';

const today = new Date();

/**
 * Define un historial de pagos de clientes.
 * Se identifica al cliente por su nombre para que el seed.ts busque el ID.
 */
export const paymentsData = [
  {
    clientName: 'Comunidad de Propietarios "El Oasis"',
    amount: 350.00, // Simula el pago de su cuota mensual
    paymentDate: subMonths(today, 1),
    method: 'Transferencia Bancaria',
    notes: 'Cuota de Mantenimiento Mes Anterior',
  },
  {
    clientName: 'Comunidad de Propietarios "El Oasis"',
    amount: 85.50, // Simula el pago de una factura de materiales
    paymentDate: subDays(today, 20),
    method: 'Transferencia Bancaria',
    notes: 'Factura 2025-0045 Materiales',
  },
  {
    clientName: 'Chalet "Villa Sol"',
    amount: 220.00, // Simula el pago de su cuota todo incluido
    paymentDate: subDays(today, 15),
    method: 'Recibo Domiciliado',
    notes: 'Cuota All-Inclusive Mes Actual',
  },
  {
    clientName: 'Hotel "Costa Serena"',
    amount: 550.75, // Simula el pago de una gran factura de productos
    paymentDate: subDays(today, 5),
    method: 'Confirming',
    notes: 'Factura 2025-0048 Consumo Productos',
  },
];

/**
 * Define un historial de gastos generales de la empresa.
 * No están asociados a un cliente, sino al tenant.
 */
export const expensesData = [
  {
    amount: 250.00,
    expenseDate: subDays(today, 10),
    description: 'Repostaje furgonetas Carlos y Ana',
    category: 'Combustible',
  },
  {
    amount: 3200.00,
    expenseDate: subMonths(today, 1),
    description: 'Nóminas mes anterior',
    category: 'Nóminas',
  },
  {
    amount: 80.00,
    expenseDate: subDays(today, 3),
    description: 'Compra de material de oficina',
    category: 'Suministros Oficina',
  },
  {
    amount: 150.00,
    expenseDate: subDays(today, 1),
    description: 'Comida de equipo',
    category: 'Dietas y Representación',
  },
];