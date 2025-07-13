// filename: packages/server/prisma/data/consumptions.ts
// version: 1.0.0
// description: Datos de semilla para los consumos de productos en las visitas.

/**
 * Define un conjunto de consumos de productos para las visitas de prueba.
 * * - `visitNotesIdentifier`: Un fragmento de texto único de las notas de la visita
 * a la que queremos asociar estos consumos. Se usará en el script de seed para
 * encontrar el ID de la visita correcta.
 * - `consumptions`: Un array de los productos y cantidades consumidas en esa visita.
 */
export const consumptionsData = [
  {
    // Para la visita con la incidencia CRÍTICA en "El Oasis"
    visitNotesIdentifier: 'Fuga de agua detectada en la tubería principal del skimmer',
    consumptions: [
      {
        productName: 'Reductor de pH Líquido', // El pH era de 7.9, es lógico añadir reductor.
        quantity: 5, // 5 Litros
      },
      {
        productName: 'Cloro Granulado (Dicloro 55%)', // Para un tratamiento de choque rápido.
        quantity: 0.5, // 0.5 Kg
      },
    ],
  },
  {
    // Para la visita con la incidencia CLASIFICADA en el "Gimnasio Fisic-Center"
    visitNotesIdentifier: 'La bomba de calor hace un ruido metálico',
    consumptions: [
      {
        productName: 'Floculante Líquido Clarificante', // La presión del filtro era alta (1.5 bar), es común añadir clarificante tras un lavado.
        quantity: 0.5, // 0.5 Litros
      },
    ],
  },
  {
    // Para añadir más consumo a la visita OK del "Hotel Costa Serena"
    // Esta visita ya tiene 1 saco de sal añadido directamente en el seed.ts, ahora añadimos más.
    visitNotesIdentifier: 'Todo en orden. Valores perfectos.',
    consumptions: [
        {
            productName: 'Pastillas Multiacción 250g', // Consumo de mantenimiento rutinario.
            quantity: 2, // 2 pastillas
        }
    ]
  }
];