// filename: packages/server/prisma/data/catalogs.ts
// version: 1.0.1
// description: Datos de semilla para los catálogos de Parámetros y Tareas de "Piscival S.L.".

import type { InputType } from '@prisma/client';

/**
 * Define la librería central de todos los servicios (mediciones y acciones).
 * Se especifica el tipo InputType para cumplir con la validación estricta de Prisma.
 */

// --- CATÁLOGO DE PARÁMETROS A MEDIR ---
export const parameterData: { name: string; unit?: string | null; type: InputType; selectOptions?: string[] }[] = [
  // Parámetros Químicos Esenciales (Tipo NUMBER)
  { name: 'Nivel de pH', unit: 'pH', type: 'NUMBER' },
  { name: 'Cloro Libre (DPD-1)', unit: 'ppm', type: 'NUMBER' },
  { name: 'Cloro Total (DPD-3)', unit: 'ppm', type: 'NUMBER' },
  { name: 'Alcalinidad Total (TA)', unit: 'ppm', type: 'NUMBER' },
  { name: 'Dureza Cálcica (TH)', unit: 'ppm', type: 'NUMBER' },
  { name: 'Ácido Cianúrico (Estabilizante)', unit: 'ppm', type: 'NUMBER' },
  { name: 'Nivel de Sal (para piscinas de sal)', unit: 'ppm', type: 'NUMBER' },

  // Parámetros Físicos (Tipo NUMBER)
  { name: 'Temperatura del Agua', unit: '°C', type: 'NUMBER' },
  { name: 'Presión del Filtro', unit: 'bar', type: 'NUMBER' },

  // Parámetros de Observación (Tipos SELECT y BOOLEAN para probar la UI)
  {
    name: 'Estado del Agua',
    type: 'SELECT',
    selectOptions: ['Cristalina', 'Ligeramente turbia', 'Muy turbia', 'Verde', 'Blanquecina'],
  },
  {
    name: 'Nivel del Agua en Skimmer',
    type: 'SELECT',
    selectOptions: ['Correcto', 'Alto', 'Bajo'],
  },
  {
    name: 'Fondo de la piscina limpio',
    type: 'BOOLEAN',
  },
];

// --- CATÁLOGO DE TAREAS A REALIZAR ---
export const taskData = [
  // Tareas de Limpieza Rutinaria
  {
    name: 'Limpieza de cestos de skimmers',
    description: 'Vaciar y limpiar los cestos de los skimmers de hojas y otros residuos.',
  },
  {
    name: 'Limpieza de cesto de bomba',
    description: 'Vaciar y limpiar el pre-filtro de la bomba para asegurar un buen flujo.',
  },
  {
    name: 'Pasar limpiafondos manual',
    description: 'Aspirar el fondo de la piscina manualmente para recoger la suciedad sedimentada.',
  },
  {
    name: 'Cepillado de paredes y línea de flotación',
    description: 'Cepillar las superficies para prevenir la adhesión de algas y depósitos calcáreos.',
  },

  // Tareas de Mantenimiento Técnico
  {
    name: 'Contralavado de filtro (Backwash)',
    description: 'Realizar un backwash completo del sistema de filtración seguido de un enjuague.',
  },
  {
    name: 'Revisión y ajuste de dosificadores automáticos',
    description: 'Comprobar el funcionamiento de bombas dosificadoras de pH y cloro.',
  },
  {
    name: 'Revisión de clorador salino',
    description: 'Verificar la producción de cloro y el estado de la célula del clorador salino.',
  },
  {
    name: 'Comprobación visual de fugas en local técnico',
    description: 'Inspeccionar tuberías, bomba y filtro en busca de goteos o fugas de agua.',
  },
  
  // Tareas de Adición de Productos (para futuro control de stock)
  {
    name: 'Añadir producto alguicida',
    description: 'Dosificar la cantidad necesaria de alguicida preventivo.',
  },
  {
    name: 'Añadir producto floculante',
    description: 'Dosificar floculante para ayudar a clarificar el agua si es necesario.',
  },
];