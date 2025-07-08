import axios from 'axios';

const apiClient = axios.create({
  // La URL base para todas las peticiones al API.
  // Gracias al proxy configurado en vite.config.ts, esto se
  // redirigirá a http://localhost:3001/api en desarrollo.
  baseURL: '/api',

  // Permite que axios envíe y reciba cookies (como nuestro token JWT)
  // en las peticiones a dominios diferentes.
  withCredentials: true,
});

export default apiClient;