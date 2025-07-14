// filename: packages/server/prisma/data/clients.ts
// version: 2.0.0
// description: Añade modelo de facturación y cuota mensual a cada cliente.

import type { BillingModel } from '@prisma/client';

/**
 * Define la cartera de clientes de la empresa de prueba.
 * Cada cliente tiene un array de piscinas asociadas. Esta estructura anidada
 * facilita la creación de ambas entidades y sus relaciones en el script de seed.
 * La variedad de clientes y modelos de facturación permite probar múltiples escenarios.
 */
export const clientsData = [
  // --- Cliente 1: Comunidad de Propietarios (Cuota + Materiales) ---
  {
    client: {
      name: 'Comunidad de Propietarios "El Oasis"',
      contactPerson: 'Sr. García (Presidente)',
      email: 'comunidad.oasis@email.com',
      phone: '611223344',
      address: 'Calle de la Concordia, 1, 28080 Madrid',
      priceModifier: 1.0,
      // --- NUEVOS DATOS ---
      monthlyFee: 350.0,
      billingModel: 'FEE_PLUS_MATERIALS' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Comunitaria Grande',
        address: 'Calle de la Concordia, 1, Zonas Comunes, 28080 Madrid',
        volume: 150,
        type: 'Cloro',
      },
      {
        name: 'Piscina Infantil',
        address: 'Calle de la Concordia, 1, Zona Infantil, 28080 Madrid',
        volume: 25,
        type: 'Cloro',
      },
    ],
  },

  // --- Cliente 2: Chalet Privado (Todo Incluido) ---
  {
    client: {
      name: 'Chalet "Villa Sol"',
      contactPerson: 'Familia Pérez-López',
      email: 'perez.lopez.familia@email.com',
      phone: '655667788',
      address: 'Avenida de la Brisa, 45, Urbanización Mirasierra, 28035 Madrid',
      priceModifier: 1.1, // Cliente premium, paga un 10% más sobre el PVP base si algo no estuviera incluido.
      // --- NUEVOS DATOS ---
      monthlyFee: 220.0,
      billingModel: 'ALL_INCLUSIVE' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Privada con Jacuzzi',
        address: 'Avenida de la Brisa, 45, 28035 Madrid',
        volume: 75,
        type: 'Sal',
      },
    ],
  },

  // --- Cliente 3: Hotel (Solo paga materiales, sin cuota) ---
  {
    client: {
      name: 'Hotel "Costa Serena"',
      contactPerson: 'Dpto. de Mantenimiento',
      email: 'mantenimiento@costaserena-hotel.com',
      phone: '911223344',
      address: 'Paseo del Relax, 2, 28010 Madrid',
      priceModifier: 0.95, // Cliente grande con descuento del 5% sobre el PVP base.
      // --- NUEVOS DATOS ---
      monthlyFee: 0.0,
      billingModel: 'SERVICE_ONLY' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Exterior Principal',
        address: 'Paseo del Relax, 2, Zona de Jardines, 28010 Madrid',
        volume: 250,
        type: 'Cloro',
      },
    ],
  },

  // --- Cliente 4: Gimnasio (Cuota + Materiales) ---
  {
    client: {
      name: 'Gimnasio "Fisic-Center"',
      contactPerson: 'Gerencia',
      email: 'gerencia@fisic-center.es',
      phone: '918765432',
      address: 'Calle del Músculo, 12, 28020 Madrid',
      priceModifier: 1.0,
      // --- NUEVOS DATOS ---
      monthlyFee: 250.0,
      billingModel: 'FEE_PLUS_MATERIALS' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Climatizada Interior',
        address: 'Calle del Músculo, 12, Sótano, 28020 Madrid',
        volume: 100,
        type: 'Cloro',
      },
    ],
  },
];