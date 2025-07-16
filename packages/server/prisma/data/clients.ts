// filename: packages/server/prisma/data/clients.ts
// version: 4.0.0 (FEAT: Add more clients for a realistic demo)
// description: Se añaden 4 nuevos perfiles de cliente para aumentar el volumen de trabajo y la diversidad de casos de uso, incluyendo diferentes modelos de facturación y tipologías de piscina.

import type { BillingModel } from '@prisma/client';

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
      monthlyFee: 350.0,
      billingModel: 'FEE_PLUS_MATERIALS' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Comunitaria Grande',
        address: 'Calle de la Concordia, 1, Zonas Comunes, 28080 Madrid',
        volume: 150,
        type: 'Cloro',
        zoneName: 'Arenal',
      },
      {
        name: 'Piscina Infantil',
        address: 'Calle de la Concordia, 1, Zona Infantil, 28080 Madrid',
        volume: 25,
        type: 'Cloro',
        zoneName: 'Arenal',
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
      priceModifier: 1.1,
      monthlyFee: 220.0,
      billingModel: 'ALL_INCLUSIVE' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Privada con Jacuzzi',
        address: 'Avenida de la Brisa, 45, 28035 Madrid',
        volume: 75,
        type: 'Sal',
        zoneName: 'Montgó',
      },
    ],
  },

  // --- Cliente 3: Hotel (Solo paga servicio, sin cuota) ---
  {
    client: {
      name: 'Hotel "Costa Serena"',
      contactPerson: 'Dpto. de Mantenimiento',
      email: 'mantenimiento@costaserena-hotel.com',
      phone: '911223344',
      address: 'Paseo del Relax, 2, 28010 Madrid',
      priceModifier: 0.95,
      monthlyFee: 0.0,
      billingModel: 'SERVICE_ONLY' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Exterior Principal',
        address: 'Paseo del Relax, 2, Zona de Jardines, 28010 Madrid',
        volume: 250,
        type: 'Cloro',
        zoneName: 'Puerto',
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
      monthlyFee: 250.0,
      billingModel: 'FEE_PLUS_MATERIALS' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Climatizada Interior',
        address: 'Calle del Músculo, 12, Sótano, 28020 Madrid',
        volume: 100,
        type: 'Cloro',
        zoneName: 'Pueblo',
      },
    ],
  },
  
  // --- NUEVOS CLIENTES PARA ENRIQUECER LA DEMO ---

  // --- Cliente 5: Apartamentos de Lujo (Recargo, varias piscinas) ---
  {
    client: {
      name: 'Residencial "Altos de la Bahía"',
      contactPerson: 'Administración Fincas Soler',
      email: 'admin@fincassoler.es',
      phone: '965887766',
      address: 'Calle de la Vista, 10, 03730 Jávea',
      priceModifier: 1.15, // Cliente premium, se le cobra más caro el producto
      monthlyFee: 500.0,
      billingModel: 'FEE_PLUS_MATERIALS' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Infinity Principal',
        address: 'Calle de la Vista, 10, Fase I, 03730 Jávea',
        volume: 120,
        type: 'Sal',
        zoneName: 'Balcón al Mar',
      },
      {
        name: 'Piscina Relax (Fase II)',
        address: 'Calle de la Vista, 10, Fase II, 03730 Jávea',
        volume: 80,
        type: 'Cloro',
        zoneName: 'Balcón al Mar',
      },
    ],
  },

  // --- Cliente 6: Cliente "Problemático" (Piscina Antigua) ---
  {
    client: {
      name: 'Finca "La Herradura"',
      contactPerson: 'Sr. Romero',
      email: 'sr.romero@email.es',
      phone: '622334455',
      address: 'Camino Viejo del Montgó, 7, 03730 Jávea',
      priceModifier: 1.0,
      monthlyFee: 150.0,
      billingModel: 'FEE_PLUS_MATERIALS' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Antigua de Gresite',
        address: 'Camino Viejo del Montgó, 7, 03730 Jávea',
        volume: 90,
        type: 'Cloro',
        zoneName: 'Montgó',
      },
    ],
  },

  // --- Cliente 7: Club de Tenis (Piscina grande de temporada) ---
  {
    client: {
      name: 'Club de Tenis "El Break"',
      contactPerson: 'Oficina del Club',
      email: 'info@clubelbreak.com',
      phone: '965112233',
      address: 'Partida Tosal, 55, 03730 Jávea',
      priceModifier: 1.0,
      monthlyFee: 400.0, // Cuota solo en temporada alta
      billingModel: 'FEE_PLUS_MATERIALS' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Social 25m',
        address: 'Partida Tosal, 55, 03730 Jávea',
        volume: 300,
        type: 'Cloro',
        zoneName: 'Tosal',
      },
    ],
  },
  
  // --- Cliente 8: Otro Chalet Privado (Para rellenar rutas) ---
  {
    client: {
      name: 'Chalet "Las Palmeras"',
      contactPerson: 'Sra. Navarro',
      email: 'navarro.familia@email.com',
      phone: '633445566',
      address: 'Calle del Ancla, 8, 03730 Jávea',
      priceModifier: 1.0,
      monthlyFee: 180.0,
      billingModel: 'ALL_INCLUSIVE' as BillingModel,
    },
    pools: [
      {
        name: 'Piscina Familiar',
        address: 'Calle del Ancla, 8, 03730 Jávea',
        volume: 60,
        type: 'Sal',
        zoneName: 'Puerto',
      },
    ],
  },
];