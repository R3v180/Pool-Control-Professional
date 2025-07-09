// filename: packages/server/prisma/data/clients.ts
// version: 1.0.0
// description: Datos de semilla para la cartera de clientes y sus piscinas de "Piscival S.L.".

/**
 * Define la cartera de clientes de la empresa de prueba.
 * Cada cliente tiene un array de piscinas asociadas. Esta estructura anidada
 * facilita la creación de ambas entidades y sus relaciones en el script de seed.
 * La variedad de clientes (comunidad, chalet, hotel, gimnasio) y piscinas
 * (cloro/sal, tamaño, ubicación) permite probar múltiples escenarios.
 */
export const clientsData = [
  // --- Cliente 1: Comunidad de Propietarios (Múltiples piscinas) ---
  {
    client: {
      name: 'Comunidad de Propietarios "El Oasis"',
      contactPerson: 'Sr. García (Presidente)',
      email: 'comunidad.oasis@email.com',
      phone: '611223344',
      address: 'Calle de la Concordia, 1, 28080 Madrid',
      priceModifier: 1.0,
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

  // --- Cliente 2: Chalet Privado (Piscina de Sal) ---
  {
    client: {
      name: 'Chalet "Villa Sol"',
      contactPerson: 'Familia Pérez-López',
      email: 'perez.lopez.familia@email.com',
      phone: '655667788',
      address: 'Avenida de la Brisa, 45, Urbanización Mirasierra, 28035 Madrid',
      priceModifier: 1.1, // Cliente premium, paga un 10% más
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

  // --- Cliente 3: Hotel (Gran volumen, uso intensivo) ---
  {
    client: {
      name: 'Hotel "Costa Serena"',
      contactPerson: 'Dpto. de Mantenimiento',
      email: 'mantenimiento@costaserena-hotel.com',
      phone: '911223344',
      address: 'Paseo del Relax, 2, 28010 Madrid',
      priceModifier: 0.95, // Cliente grande con descuento del 5%
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

  // --- Cliente 4: Gimnasio (Piscina interior, "problemática") ---
  {
    client: {
      name: 'Gimnasio "Fisic-Center"',
      contactPerson: 'Gerencia',
      email: 'gerencia@fisic-center.es',
      phone: '918765432',
      address: 'Calle del Músculo, 12, 28020 Madrid',
      priceModifier: 1.0,
    },
    pools: [
      {
        name: 'Piscina Climatizada Interior',
        address: 'Calle del Músculo, 12, Sótano, 28020 Madrid',
        volume: 100,
        type: 'Cloro', // Las piscinas interiores con cloro suelen generar cloraminas (olor a cloro)
      },
    ],
  },
];