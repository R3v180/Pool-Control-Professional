// filename: packages/server/prisma/data/incident-tasks.ts
// version: 2.0.0 (FEAT: Add more varied incident tasks for a realistic demo)
// description: Se añaden 5 nuevos escenarios de tareas de incidencia con diferentes prioridades y asignaciones para simular un entorno operativo más complejo y realista.

import { IncidentPriority, IncidentTaskStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const today = new Date();
const tomorrow = addDays(today, 1);
const yesterday = subDays(today, 1);
const nextWeek = addDays(today, 7);
const twoDaysAgo = subDays(today, 2);

/**
 * Define un conjunto de tareas de incidencia de prueba.
 * Cada objeto tiene una propiedad 'notificationMessage' que usaremos en el script
 * de seed para encontrar la notificación padre correcta a la que asociar la tarea.
 */
export const incidentTasksData = [
  {
    // Tarea para la incidencia CRÍTICA de la fuga. Es urgente y ya está en progreso.
    notificationMessage: 'Fuga de agua detectada en la tubería principal del skimmer.',
    task: {
      title: 'Contactar a fontanero para presupuesto de reparación de fuga',
      description: 'Llamar a Fontanería Express (91 123 45 67) y pedir presupuesto urgente. Mencionar que es para la Comunidad "El Oasis".',
      priority: 'CRITICAL' as IncidentPriority,
      status: 'IN_PROGRESS' as IncidentTaskStatus,
      deadline: tomorrow, // Plazo para mañana
      // La asignación se hará a Jorge Supervisor en el seed.ts
    },
  },
  {
    // Tarea secundaria para la misma incidencia de la fuga.
    notificationMessage: 'Fuga de agua detectada en la tubería principal del skimmer.',
    task: {
      title: 'Cerrar llave de paso del skimmer afectado',
      description: 'Para minimizar la pérdida de agua hasta que venga el fontanero, cerrar la llave de paso correspondiente en el local técnico.',
      priority: 'HIGH' as IncidentPriority,
      status: 'COMPLETED' as IncidentTaskStatus,
      resolutionNotes: 'Llave de paso cerrada a las 10:30. Ya no gotea. Se ha informado al presidente.',
      // La asignación se hará a un técnico en el seed.ts
    },
  },
  {
    // Tarea para la incidencia de falta de sal.
    notificationMessage: 'El nivel de sal es bajo, pero no hay producto en el almacén.',
    task: {
      title: 'Comprar sacos de sal para el almacén',
      description: 'Ir al proveedor habitual (PRO-PISCINAS) y comprar 5 sacos de sal especial para clorador. Guardar factura.',
      priority: 'NORMAL' as IncidentPriority,
      status: 'PENDING' as IncidentTaskStatus,
      deadline: nextWeek, // Plazo de una semana
      // La asignación se hará a un técnico en el seed.ts
    },
  },
  {
    // Tarea para la incidencia del ruido de la bomba de calor. Plazo vencido.
    notificationMessage: 'La bomba de calor hace un ruido metálico muy fuerte al arrancar.',
    task: {
      title: 'Revisar rodamientos de la bomba de calor',
      description: 'Desmontar la carcasa y verificar si los rodamientos del motor tienen holgura o están oxidados. Engrasar si es posible.',
      priority: 'HIGH' as IncidentPriority,
      status: 'PENDING' as IncidentTaskStatus, // Sigue pendiente
      deadline: yesterday, // El plazo era para ayer, por lo que está VENCIDA.
      // La asignación se hará a un técnico en el seed.ts
    },
  },
  // --- NUEVAS TAREAS PARA ENRIQUECER LA DEMO ---
  {
    // Tarea de baja prioridad, para rellenar.
    notificationMessage: 'El agua está ligeramente turbia a pesar de los parámetros correctos.',
    task: {
      title: 'Realizar tratamiento de clarificación con floculante',
      description: 'Aplicar dosis de mantenimiento de floculante en la próxima visita rutinaria para mejorar la transparencia.',
      priority: 'LOW' as IncidentPriority,
      status: 'PENDING' as IncidentTaskStatus,
      deadline: addDays(today, 10),
      // La asignación se hará a un técnico en el seed.ts
    },
  },
  {
    // Incidencia reportada por el cliente "problemático".
    notificationMessage: 'El limpiafondos automático se queda atascado en una esquina.',
    task: {
      title: 'Ajustar jets y contrapesos del limpiafondos',
      description: 'Revisar la posición de los jets de impulsión y los contrapesos del limpiafondos para asegurar que cubra toda la piscina.',
      priority: 'NORMAL' as IncidentPriority,
      status: 'PENDING' as IncidentTaskStatus,
      deadline: addDays(today, 3),
       // La asignación se hará a un técnico en el seed.ts
    },
  },
  {
    // Otra tarea para la incidencia del limpiafondos, esta vez de gestión.
    notificationMessage: 'El limpiafondos automático se queda atascado en una esquina.',
    task: {
      title: 'Llamar al cliente para informar sobre el ajuste del limpiafondos',
      description: 'Una vez ajustado, llamar al Sr. Romero para informarle y pedirle que observe su funcionamiento.',
      priority: 'LOW' as IncidentPriority,
      status: 'PENDING' as IncidentTaskStatus,
      deadline: addDays(today, 4),
      // La asignación se hará a Jorge Supervisor en el seed.ts
    },
  },
  {
    // Tarea crítica para el club de tenis antes de su apertura de temporada.
    notificationMessage: 'Foco subacuático fundido. Urge reparación antes del fin de semana.',
    task: {
      title: 'Sustituir foco subacuático de la piscina social',
      description: 'Cliente necesita el foco funcionando para un evento el sábado. Comprobar stock de lámpara PAR56 LED y proceder a la sustitución con las medidas de seguridad pertinentes.',
      priority: 'CRITICAL' as IncidentPriority,
      status: 'PENDING' as IncidentTaskStatus,
      deadline: addDays(today, 2), // Plazo muy corto
       // La asignación se hará a un técnico en el seed.ts
    },
  },
  {
    // Tarea completada para demostrar el historial.
    notificationMessage: 'Se ha roto la tapa de un skimmer. Dejar una nueva en la próxima visita.',
    task: {
      title: 'Reemplazar tapa de skimmer rota',
      description: 'Se ha dejado una tapa de skimmer nueva del modelo correspondiente.',
      priority: 'NORMAL' as IncidentPriority,
      status: 'COMPLETED' as IncidentTaskStatus,
      resolutionNotes: 'Tapa de skimmer reemplazada por una nueva. Se ha dejado la factura en el buzón del cliente como solicitado.',
      deadline: twoDaysAgo, // Tarea ya completada.
       // La asignación se hará a un técnico en el seed.ts
    },
  },
];