// filename: packages/server/prisma/data/transactions.ts
// version: 2.0.0 (FEAT: Add more financial transactions for demo)
// description: Se añaden más pagos de los nuevos clientes y más gastos generales para que los informes financieros y el dashboard de gerencia sean más realistas.

import { subMonths, subDays } from 'date-fns';

const today = new Date();

/**
 * Define un historial de pagos de clientes.
 * Se identifica al cliente por su nombre para que el seed.ts busque el ID.
 */
export const paymentsData = [
  {
    clientName: 'Comunidad de Propietarios "El Oasis"',
    amount: 350.00,
    paymentDate: subMonths(today, 1),
    method: 'Transferencia Bancaria',
    notes: 'Cuota de Mantenimiento Mes Anterior',
  },
  {
    clientName: 'Comunidad de Propietarios "El Oasis"',
    amount: 85.50,
    paymentDate: subDays(today, 20),
    method: 'Transferencia Bancaria',
    notes: 'Factura 2025-0045 Materiales',
  },
  {
    clientName: 'Chalet "Villa Sol"',
    amount: 220.00,
    paymentDate: subDays(today, 15),
    method: 'Recibo Domiciliado',
    notes: 'Cuota All-Inclusive Mes Actual',
  },
  {
    clientName: 'Hotel "Costa Serena"',
    amount: 550.75,
    paymentDate: subDays(today, 5),
    method: 'Confirming',
    notes: 'Factura 2025-0048 Consumo Productos',
  },
  // --- NUEVOS PAGOS ---
  {
    clientName: 'Gimnasio "Fisic-Center"',
    amount: 250.00,
    paymentDate: subDays(today, 2),
    method: 'Transferencia Bancaria',
    notes: 'Cuota Mensual',
  },
  {
    clientName: 'Residencial "Altos de la Bahía"',
    amount: 500.00,
    paymentDate: subDays(today, 3),
    method: 'Transferencia Bancaria',
    notes: 'Cuota Mantenimiento',
  },
    {
    clientName: 'Club de Tenis "El Break"',
    amount: 400.00,
    paymentDate: subDays(today, 1),
    method: 'Talón',
    notes: 'Pago cuota inicio temporada',
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
  // --- NUEVOS GASTOS ---
  {
    amount: 120.50,
    expenseDate: subDays(today, 18),
    description: 'Reparación pinchazo furgoneta Leo',
    category: 'Mantenimiento Vehículos',
  },
  {
    amount: 65.00,
    expenseDate: subDays(today, 25),
    description: 'Telefonía móvil mes anterior',
    category: 'Comunicaciones',
  },
  {
    amount: 450.00,
    expenseDate: subDays(today, 8),
    description: 'Compra de recambios para almacén',
    category: 'Stock y Materiales',
  },
];