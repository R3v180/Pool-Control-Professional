// filename: packages/server/prisma/data/user-availabilities.ts
// version: 1.0.0
// description: [NUEVO] Datos de semilla para las ausencias planificadas de los usuarios.

import { addDays, startOfWeek } from 'date-fns';

// Obtenemos el inicio de la semana actual para que los datos de ausencia
// coincidan con la semana para la que el seeder genera visitas.
const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });

export const userAvailabilitiesData = [
  {
    // Vamos a simular que Carlos se toma toda la semana de vacaciones.
    // El seeder le asigna rutas el Lunes y el Jueves. Cuando implementemos la lógica
    // en el backend, estas visitas deberían ser marcadas como "huérfanas".
    userName: 'Carlos Técnico',
    reason: 'Vacaciones Anuales',
    
    // La ausencia cubre toda la semana laboral.
    startDate: startOfCurrentWeek, // Lunes de esta semana
    endDate: addDays(startOfCurrentWeek, 4), // Viernes de esta semana
  },
  // Aquí podríamos añadir más ausencias para otros técnicos si fuera necesario.
];