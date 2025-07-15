// ====== [NUEVO] packages/server/prisma/data/route-templates.ts ======
// filename: packages/server/prisma/data/route-templates.ts
// version: 1.0.3 (FIX: Use string literals for enums)
// description: Datos de semilla para las Rutas Maestras, incluyendo estacionalidad. Usa strings literales para evitar problemas de importación de enums.

// No se necesita ninguna importación de @prisma/client

/**
 * Define las rutas maestras de la empresa.
 * Cada ruta especifica un día, un técnico habitual, las zonas que cubre
 * y las frecuencias de visita según la temporada.
 */
export const routeTemplatesData = [
  {
    name: 'Lunes - Ruta Arenal',
    // ✅ Se usa el string literal que coincide con el enum
    dayOfWeek: 'MONDAY',
    technicianName: 'Carlos Técnico',
    zoneNames: ['Arenal', 'Montgó'],
    seasons: [
      {
        frequency: 'WEEKLY', // Frecuencia semanal
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-09-30'),
      },
      {
        frequency: 'BIWEEKLY', // Frecuencia quincenal
        startDate: new Date('2025-10-01'),
        endDate: new Date('2026-05-31'),
      },
    ],
  },
  {
    name: 'Martes - Ruta Puerto',
    dayOfWeek: 'TUESDAY',
    technicianName: 'Ana Técnica',
    zoneNames: ['Puerto'],
    seasons: [
      {
        frequency: 'WEEKLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      },
    ],
  },
  {
    name: 'Miércoles - Mantenimiento Intensivo',
    dayOfWeek: 'WEDNESDAY',
    technicianName: 'Leo Ayudante',
    zoneNames: ['Arenal'], 
    seasons: [
      {
        frequency: 'WEEKLY',
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-08-31'),
      },
    ],
  },
  {
    name: 'Jueves - Ruta Pueblo y Tosal',
    dayOfWeek: 'THURSDAY',
    technicianName: 'Carlos Técnico',
    zoneNames: ['Pueblo', 'Tosal'],
    seasons: [
      {
        frequency: 'WEEKLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      },
    ],
  },
  {
    name: 'Viernes - Ruta Balcón y Repaso',
    dayOfWeek: 'FRIDAY',
    technicianName: 'Ana Técnica',
    zoneNames: ['Balcón al Mar', 'Montgó'],
    seasons: [
      {
        frequency: 'WEEKLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      },
    ],
  },
];