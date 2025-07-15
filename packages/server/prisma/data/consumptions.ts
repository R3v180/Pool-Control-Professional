// ====== [41] packages/server/prisma/data/consumptions.ts ======
// filename: packages/server/prisma/data/consumptions.ts
// version: 2.0.0
// description: Datos de semilla enriquecidos para los consumos de productos en las visitas, para una demo más visual.

/**
 * Define un conjunto de consumos de productos para las visitas de prueba.
 * Se ha aumentado la variedad para asegurar que el dashboard de gerencia
 * muestre un gráfico de "Top 5 Productos" más representativo.
 */
export const consumptionsData = [
  {
    // --- VISITA 1: Incidencia CRÍTICA en "El Oasis" (fuga) ---
    // El pH estaba alto (7.9), así que añadimos reductor.
    // El cloro se añade para un tratamiento de choque rápido.
    visitNotesIdentifier: 'Fuga de agua detectada en la tubería principal del skimmer',
    consumptions: [
      {
        productName: 'Reductor de pH Líquido',
        quantity: 5, // 5 Litros
      },
      {
        productName: 'Cloro Granulado (Dicloro 55%)',
        quantity: 0.5, // 0.5 Kg
      },
    ],
  },
  {
    // --- VISITA 2: Incidencia CLASIFICADA en el "Gimnasio Fisic-Center" (ruido bomba) ---
    // La presión del filtro era alta (1.5 bar), es común añadir clarificante tras un lavado.
    visitNotesIdentifier: 'La bomba de calor hace un ruido metálico',
    consumptions: [
      {
        productName: 'Floculante Líquido Clarificante',
        quantity: 1.5, // 1.5 Litros
      },
      {
        productName: 'Incrementador de pH Sólido', // Para ajustar pH después del contralavado
        quantity: 1, // 1 Kg
      }
    ],
  },
  {
    // --- VISITA 3: Visita OK del "Hotel Costa Serena" ---
    // Esta visita ya tiene 1 saco de sal añadido en el seed.ts. Le añadimos más cosas.
    visitNotesIdentifier: 'Todo en orden. Valores perfectos.',
    consumptions: [
        {
            productName: 'Pastillas Multiacción 250g', // Consumo de mantenimiento rutinario.
            quantity: 4, // 4 pastillas para una piscina grande
        },
        {
            productName: 'Alguicida Concentrado', // Dosis de mantenimiento para prevenir
            quantity: 0.75, // 0.75 Litros
        }
    ]
  },
  {
    // --- VISITA 4: Incidencia PENDIENTE en "Chalet Villa Sol" (falta de sal) ---
    // No podemos añadir consumo de sal porque no había, pero sí de otros productos.
    visitNotesIdentifier: 'El nivel de sal es bajo, pero no hay producto en el almacén.',
    consumptions: [
      {
        productName: 'Reductor de pH Líquido', // Supongamos que el pH también necesitaba ajuste.
        quantity: 2, // 2 Litros
      },
    ]
  }
];