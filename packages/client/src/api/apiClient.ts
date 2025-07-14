// filename: packages/client/src/api/apiClient.ts
// version: 2.0.0 (FEAT: Add interceptor for Manager role view)

import axios from 'axios';

// Importamos el store de Zustand que crearemos a continuación.
// Es una solución más limpia que importar el hook useAuth fuera de un componente.
import { useAuthStore } from '../stores/auth.store.js';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// --- ✅ NUEVO INTERCEPTOR ---
// Este código se ejecuta antes de CADA petición que se haga con apiClient.
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el estado actual del store de autenticación.
    const { user, activeView } = useAuthStore.getState();

    // Si el usuario es un MANAGER y la vista activa NO es 'MANAGER',
    // añadimos la cabecera especial.
    if (user?.role === 'MANAGER' && activeView !== 'MANAGER') {
      config.headers['X-View-As-Role'] = activeView;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default apiClient;