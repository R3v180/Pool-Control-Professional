// filename: packages/server/prisma/data/incident-tasks.ts
// version: 1.0.0
// description: Datos de semilla para las Tareas de Incidencia (Ticketing).

import { IncidentPriority, IncidentTaskStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const today = new Date();
const tomorrow = addDays(today, 1);
const yesterday = subDays(today, 1);
const nextWeek = addDays(today, 7);

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
      // La asignación se hará en el script de seed.
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
      // La asignación se hará en el script de seed.
    },
  },
  {
    // Tarea para la incidencia de falta de sal.
    notificationMessage: 'El nivel de sal es bajo, pero no hay producto en el almacén. Avisar para reponer.',
    task: {
      title: 'Comprar sacos de sal para el almacén',
      description: 'Ir al proveedor habitual (PRO-PISCINAS) y comprar 5 sacos de sal especial para clorador. Guardar factura.',
      priority: 'NORMAL' as IncidentPriority,
      status: 'PENDING' as IncidentTaskStatus,
      deadline: nextWeek, // Plazo de una semana
      // La asignación se hará en el script de seed.
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
      // La asignación se hará en el script de seed.
    },
  },
];