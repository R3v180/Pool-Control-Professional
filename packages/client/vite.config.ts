import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Configuramos un proxy para evitar problemas de CORS en desarrollo.
    // Todas las peticiones del frontend a '/api' serán redirigidas
    // a nuestro servidor de backend en el puerto 3001.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});