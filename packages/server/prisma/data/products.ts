// filename: packages/server/prisma/data/products.ts
// version: 2.0.0
// description: Añade PVP, IVA y categoría a cada producto.

export const productData = [
  // --- Químicos Desinfectantes ---
  {
    name: 'Hipoclorito Sódico 15%',
    description: 'Cloro líquido para desinfección de choque y mantenimiento.',
    unit: 'L',
    cost: 1.20,
    salePrice: 2.50, // PVP
    taxRate: 21,
    categoryName: 'Químicos Desinfectantes',
  },
  {
    name: 'Cloro Granulado (Dicloro 55%)',
    description: 'Cloro de disolución rápida para tratamientos de choque.',
    unit: 'Kg',
    cost: 8.50,
    salePrice: 14.90,
    taxRate: 21,
    categoryName: 'Químicos Desinfectantes',
  },
  {
    name: 'Pastillas Multiacción 250g',
    description: 'Pastillas de cloro de disolución lenta con acción desinfectante, alguicida y floculante.',
    unit: 'Unidad',
    cost: 2.75,
    salePrice: 4.50,
    taxRate: 21,
    categoryName: 'Químicos Desinfectantes',
  },

  // --- Químicos Reguladores ---
  {
    name: 'Reductor de pH Líquido',
    description: 'Ácido sulfúrico para bajar el nivel de pH del agua.',
    unit: 'L',
    cost: 2.10,
    salePrice: 3.95,
    taxRate: 21,
    categoryName: 'Químicos Reguladores',
  },
  {
    name: 'Incrementador de pH Sólido',
    description: 'Producto en polvo para subir el nivel de pH del agua.',
    unit: 'Kg',
    cost: 4.50,
    salePrice: 7.80,
    taxRate: 21,
    categoryName: 'Químicos Reguladores',
  },

  // --- Químicos de Mantenimiento ---
  {
    name: 'Alguicida Concentrado',
    description: 'Tratamiento preventivo y de choque contra todo tipo de algas.',
    unit: 'L',
    cost: 9.70,
    salePrice: 18.50,
    taxRate: 21,
    categoryName: 'Químicos de Mantenimiento',
  },
  {
    name: 'Floculante Líquido Clarificante',
    description: 'Agrupa las partículas en suspensión para mejorar la filtración y dar transparencia al agua.',
    unit: 'L',
    cost: 5.80,
    salePrice: 11.20,
    taxRate: 21,
    categoryName: 'Químicos de Mantenimiento',
  },

  // --- Sal y Electrólisis ---
  {
    name: 'Sal para Piscinas (Saco)',
    description: 'Sal especial para equipos de cloración salina.',
    unit: 'Saco 25Kg',
    cost: 12.50,
    salePrice: 22.00,
    taxRate: 21,
    categoryName: 'Sal y Electrólisis',
  },
];