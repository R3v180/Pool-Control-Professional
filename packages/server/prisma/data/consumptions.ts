// filename: packages/server/prisma/data/consumptions.ts
// version: 3.0.0 (FEAT: Add more varied consumption data)
// description: Se añaden más datos de consumo asociados a las nuevas incidencias para enriquecer los informes y simular una actividad económica más realista.

/**
 * Define un conjunto de consumos de productos para las visitas de prueba.
 * Cada objeto está ligado a una incidencia a través de su mensaje (`visitNotesIdentifier`).
 */
export const consumptionsData = [
  {
    visitNotesIdentifier: 'Fuga de agua detectada en la tubería principal del skimmer.',
    consumptions: [
      {
        productName: 'Reductor de pH Líquido',
        quantity: 5,
      },
      {
        productName: 'Cloro Granulado (Dicloro 55%)',
        quantity: 0.5,
      },
    ],
  },
  {
    visitNotesIdentifier: 'La bomba de calor hace un ruido metálico muy fuerte al arrancar.',
    consumptions: [
      {
        productName: 'Floculante Líquido Clarificante',
        quantity: 1.5,
      },
      {
        productName: 'Incrementador de pH Sólido',
        quantity: 1,
      }
    ],
  },
  {
    visitNotesIdentifier: 'El agua está ligeramente turbia a pesar de los parámetros correctos.',
    consumptions: [
        {
            productName: 'Pastillas Multiacción 250g',
            quantity: 4,
        },
        {
            productName: 'Alguicida Concentrado',
            quantity: 0.75,
        }
    ]
  },
  {
    visitNotesIdentifier: 'El nivel de sal es bajo, pero no hay producto en el almacén.',
    consumptions: [
      {
        productName: 'Reductor de pH Líquido',
        quantity: 2,
      },
    ]
  },

  // --- NUEVOS CONSUMOS PARA ENRIQUECER LA DEMO ---

  {
    visitNotesIdentifier: 'El limpiafondos automático se queda atascado en una esquina.',
    consumptions: [
      // No hay consumo de producto químico, pero se podría registrar el uso de una pieza.
      // Por ahora, lo dejamos sin consumo para demostrar el caso.
    ]
  },
  {
    visitNotesIdentifier: 'Foco subacuático fundido. Urge reparación antes del fin de semana.',
    consumptions: [
      {
        productName: 'Lámpara LED PAR56 Blanca',
        quantity: 1,
      },
      {
        productName: 'Junta estanca para foco',
        quantity: 1,
      }
    ]
  },
  {
    visitNotesIdentifier: 'Se ha roto la tapa de un skimmer. Dejar una nueva en la próxima visita.',
    consumptions: [
      {
        productName: 'Tapa de Skimmer Universal',
        quantity: 1,
      }
    ]
  },
  {
    // Consumo en una visita rutinaria sin incidencias para el nuevo cliente de lujo
    visitNotesIdentifier: 'Mantenimiento rutinario en Altos de la Bahía. Todo correcto.',
    consumptions: [
       {
        productName: 'Sal para Piscinas (Saco)',
        quantity: 2,
      },
       {
        productName: 'Reductor de pH Líquido',
        quantity: 1.5,
      },
    ]
  },
  {
    // Consumo para el Club de Tenis, que necesita más producto por su tamaño
    visitNotesIdentifier: 'Mantenimiento pre-apertura en Club de Tenis El Break.',
    consumptions: [
      {
        productName: 'Hipoclorito Sódico 15%',
        quantity: 20, // Cantidad grande por el volumen de la piscina
      },
      {
        productName: 'Alguicida Concentrado',
        quantity: 5,
      },
      {
        productName: 'Incrementador de pH Sólido',
        quantity: 3,
      }
    ]
  },
];