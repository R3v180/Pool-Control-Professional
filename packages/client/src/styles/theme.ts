import { createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';

// Definimos una paleta de colores personalizada para nuestra marca.
// Puedes generar las tuyas en https://mantine.dev/colors-generator/
const brandBlue: MantineColorsTuple = [
  '#e7f5ff',
  '#d0ebff',
  '#a5d8ff',
  '#74c0fc',
  '#4dabf7',
  '#339af0',
  '#228be6',
  '#1c7ed6',
  '#1572c3',
  '#1068b1',
];

export const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  primaryColor: 'brandBlue',

  colors: {
    brandBlue,
  },

  headings: {
    fontFamily: 'Inter, sans-serif',
  },
});