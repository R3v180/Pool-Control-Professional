// filename: packages/server/prisma/data/products.ts
// version: 1.0.0
// description: Datos de semilla para el catálogo de productos de "Piscival S.L.".

export const productData = [
  // --- Desinfectantes ---
  {
    name: 'Hipoclorito Sódico 15%',
    description: 'Cloro líquido para desinfección de choque y mantenimiento.',
    unit: 'L', // Litros
    cost: 1.20,
  },
  {
    name: 'Cloro Granulado (Dicloro 55%)',
    description: 'Cloro de disolución rápida para tratamientos de choque.',
    unit: 'Kg', // Kilogramos
    cost: 8.50,
  },
  {
    name: 'Pastillas Multiacción 250g',
    description: 'Pastillas de cloro de disolución lenta con acción desinfectante, alguicida y floculante.',
    unit: 'Unidad', // Por pastilla
    cost: 2.75,
  },

  // --- Reguladores de pH ---
  {
    name: 'Reductor de pH Líquido',
    description: 'Ácido sulfúrico para bajar el nivel de pH del agua.',
    unit: 'L',
    cost: 2.10,
  },
  {
    name: 'Incrementador de pH Sólido',
    description: 'Producto en polvo para subir el nivel de pH del agua.',
    unit: 'Kg',
    cost: 4.50,
  },

  // --- Productos Específicos y de Mantenimiento ---
  {
    name: 'Alguicida Concentrado',
    description: 'Tratamiento preventivo y de choque contra todo tipo de algas.',
    unit: 'L',
    cost: 9.70,
  },
  {
    name: 'Floculante Líquido Clarificante',
    description: 'Agrupa las partículas en suspensión para mejorar la filtración y dar transparencia al agua.',
    unit: 'L',
    cost: 5.80,
  },
  {
    name: 'Sal para Piscinas (Saco)',
    description: 'Sal especial para equipos de cloración salina.',
    unit: 'Saco 25Kg',
    cost: 12.50,
  },
];