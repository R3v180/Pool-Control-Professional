// filename: packages/server/prisma/data/financial-rules.ts
// version: 1.0.0
// description: Datos de semilla para las reglas de precios personalizadas.

/**
 * Define las reglas de descuento específicas por cliente.
 * Cada regla se identifica por el nombre del cliente y el nombre del producto/categoría.
 * El script de seed.ts se encargará de buscar los IDs correspondientes.
 */
export const clientPricingRulesData = [
  {
    // REGLA 1: Descuento aplicado a una CATEGORÍA completa para un cliente.
    // La Comunidad "El Oasis" tiene un 5% de descuento en todos los desinfectantes.
    clientName: 'Comunidad de Propietarios "El Oasis"',
    categoryName: 'Químicos Desinfectantes',
    discountPercentage: 5.0,
  },
  {
    // REGLA 2: Descuento aplicado a un PRODUCTO específico para un cliente.
    // El Hotel "Costa Serena" tiene un 10% de descuento en las pastillas de cloro,
    // que es un producto de alto consumo para ellos.
    clientName: 'Hotel "Costa Serena"',
    productName: 'Pastillas Multiacción 250g',
    discountPercentage: 10.0,
  },
  {
    // REGLA 3: Múltiples reglas para un mismo cliente.
    // El Gimnasio "Fisic-Center" tiene un descuento en los reguladores (categoría)
    // y uno aún mayor en el alguicida (producto).
    clientName: 'Gimnasio "Fisic-Center"',
    categoryName: 'Químicos Reguladores',
    discountPercentage: 7.5,
  },
  {
    clientName: 'Gimnasio "Fisic-Center"',
    productName: 'Alguicida Concentrado',
    discountPercentage: 15.0,
  },
  // NOTA: El cliente "Chalet 'Villa Sol'" no tiene reglas específicas.
  // Esto nos permitirá probar que el sistema le aplica correctamente su
  // recargo general (`priceModifier`) sin descuentos adicionales.
];