// filename: packages/server/prisma/data/product-categories.ts
// version: 1.0.0
// description: Datos de semilla para las categorías de productos.

/**
 * Define las familias o categorías en las que se agruparán los productos.
 * Esto es clave para poder aplicar reglas de precios a nivel de categoría.
 */
export const productCategoriesData = [
  { name: 'Químicos Reguladores' },     // Para productos como pH, alcalinidad, etc.
  { name: 'Químicos Desinfectantes' },  // Para cloro, bromo, etc.
  { name: 'Químicos de Mantenimiento' },// Para alguicidas, floculantes, etc.
  { name: 'Sal y Electrólisis' },       // Para sacos de sal y recambios de cloradores.
  { name: 'Material de Limpieza' },     // Para cepillos, recogehojas, etc.
  { name: 'Recambios y Fontanería' },  // Para juntas, válvulas, etc.
];