// ====== [66] packages/server/src/api/incident-tasks/incident-tasks.service.ts ======
// filename: packages/server/src/api/incident-tasks/incident-tasks.service.ts
// version: 1.6.0 (FIX: Use existing fields for query)
// description: Corrected the getTasksByNotificationId function to select and order by fields that exist in the current schema.

import { PrismaClient } from '@prisma/client';
import type { IncidentTask, IncidentPriority, IncidentTaskStatus, IncidentTaskLog } from '@prisma/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const prisma = new PrismaClient();

// --- Tipos de Entrada (DTOs) ---
export type CreateIncidentTaskInput = {
  title: string;
  notificationId: string;
  tenantId: string;
  description?: string;
  priority?: IncidentPriority;
  assignedToId?: string;
};
export type UpdateIncidentTaskInput = {
  title?: string;
  description?: string;
  status?: IncidentTaskStatus;
  priority?: IncidentPriority;
  assignedToId?: string | null;
  resolutionNotes?: string;
  deadline?: string | null;
};
export type AddLogInput = {
  details: string;
  newDeadline?: string;
};

// --- Funciones del Servicio ---

export const createIncidentTask = async (data: CreateIncidentTaskInput, actorId: string): Promise<IncidentTask> => {
  const task = await prisma.incidentTask.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      notificationId: data.notificationId,
      assignedToId: data.assignedToId,
      tenantId: data.tenantId,
    },
  });
  await prisma.incidentTaskLog.create({
    data: {
      action: 'CREATION',
      details: `Tarea creada.`,
      incidentTaskId: task.id,
      userId: actorId,
    }
  });
  return task;
};

export const getTasksByNotificationId = async (notificationId: string, tenantId: string): Promise<IncidentTask[]> => {
  // ✅ CORRECCIÓN: Se ajusta la consulta para usar campos existentes.
  return prisma.incidentTask.findMany({
    where: { notificationId, tenantId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      deadline: true,
      resolutionNotes: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      // Los campos createdAt y updatedAt no existen en el modelo IncidentTask,
      // por lo tanto, no se pueden seleccionar.
      notificationId: true, 
      assignedToId: true,
      tenantId: true,
      logs: false, // No incluimos los logs en esta consulta por rendimiento
    },
    // Se ordena por prioridad y luego por id.
    orderBy: [{ priority: 'desc' }, { id: 'asc' }],
  });
};

export const getTasksAssignedToUser = async (userId: string): Promise<IncidentTask[]> => {
  return prisma.incidentTask.findMany({ where: { assignedToId: userId, status: { in: ['PENDING', 'IN_PROGRESS'], }, }, include: { notification: { include: { visit: { include: { pool: { select: { name: true } } } } } } }, orderBy: { priority: 'desc', }, });
};

export const updateIncidentTask = async (id: string, data: UpdateIncidentTaskInput): Promise<IncidentTask> => {
  return prisma.$transaction(async (tx) => {
    const originalTask = await tx.incidentTask.findUniqueOrThrow({
      where: { id },
      include: { assignedTo: true }
    });

    const updatedTask = await tx.incidentTask.update({
        where: { id },
        data: {
          ...data,
          deadline: data.deadline ? new Date(data.deadline) : null,
        },
        include: { assignedTo: true, notification: true }
    });

    const originalDeadline = originalTask.deadline;
    const updatedDeadline = updatedTask.deadline;
    
    if (originalDeadline?.getTime() !== updatedDeadline?.getTime() && updatedTask.assignedTo) {
      const formattedDeadline = updatedDeadline 
        ? format(updatedDeadline, "d MMMM yyyy 'a las' HH:mm", { locale: es })
        : 'eliminado';
      
      const message = `El plazo para tu tarea "${updatedTask.title}" ha sido actualizado a: ${formattedDeadline}.`;
      
      await tx.notification.create({
        data: {
          message,
          tenantId: updatedTask.tenantId,
          userId: updatedTask.assignedTo.id,
          parentNotificationId: updatedTask.notificationId,
        }
      });
    }

    return updatedTask;
  });
};

export const deleteIncidentTask = async (id: string): Promise<void> => {
  await prisma.incidentTask.delete({ where: { id } });
};

export const updateTaskStatus = async (taskId: string, actorId: string, status: IncidentTaskStatus, resolutionNotes?: string) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.incidentTask.update({
      where: { id: taskId },
      data: { status, resolutionNotes },
      include: { assignedTo: true, notification: true },
    });

    if (!task.assignedTo) throw new Error("La tarea no tiene un asignado.");
    
    await tx.incidentTaskLog.create({
      data: {
        action: 'STATUS_CHANGE',
        details: `Estado cambiado a ${status} por ${task.assignedTo.name}.`,
        incidentTaskId: taskId,
        userId: actorId,
      }
    });

    if (status === 'COMPLETED') {
      await tx.notification.create({
        data: {
          message: `La tarea "${task.title}" ha sido completada.`,
          tenantId: task.tenantId,
          userId: task.notification.userId, 
          parentNotificationId: task.notificationId,
        }
      });
    }
    return task;
  });
};

export const addTaskLog = async (taskId: string, actorId: string, data: AddLogInput) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.incidentTask.findUnique({
      where: { id: taskId },
      include: { assignedTo: true, notification: true },
    });

    if (!task || !task.assignedTo) throw new Error("Tarea o técnico asignado no encontrados.");

    let logDetails = data.details;
    let notificationMessage = `Actualización sobre "${task.title}": ${data.details}`;
    let logAction: any = 'COMMENT';

    if (data.newDeadline) {
      const formattedDeadline = format(new Date(data.newDeadline), "d MMMM yyyy 'a las' HH:mm", { locale: es });
      logDetails = `[SOLICITUD DE APLAZAMIENTO] ${data.details}. Se solicita nuevo plazo para: ${formattedDeadline}.`;
      notificationMessage = `Solicitud de aplazamiento de ${task.assignedTo.name} para la tarea "${task.title}".`;
      logAction = 'DEADLINE_REQUEST';
    }

    const log = await tx.incidentTaskLog.create({
      data: {
        action: logAction,
        details: logDetails,
        incidentTaskId: taskId,
        userId: actorId,
      }
    });

    const authorIsTechnician = actorId === task.assignedToId;
    const recipientId = authorIsTechnician ? task.notification.userId : task.assignedToId;

    if (recipientId) {
        await tx.notification.create({
            data: {
                message: notificationMessage,
                tenantId: task.tenantId,
                userId: recipientId,
                parentNotificationId: task.notificationId, 
            }
        });
    }

    return log;
  });
};

export const getTaskLogs = async (taskId: string): Promise<IncidentTaskLog[]> => {
    return prisma.incidentTaskLog.findMany({
        where: { incidentTaskId: taskId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
    });
};

export const updateTaskDeadline = async (taskId: string, deadline: string, actorId: string): Promise<IncidentTask> => {
  return prisma.$transaction(async (tx) => {
    const actor = await tx.user.findUniqueOrThrow({ where: { id: actorId } });
    
    const updatedTask = await tx.incidentTask.update({
      where: { id: taskId },
      data: { deadline: new Date(deadline) },
      include: { assignedTo: true }
    });

    const formattedDeadline = format(new Date(deadline), "d MMMM yyyy 'a las' HH:mm", { locale: es });
    await tx.incidentTaskLog.create({
      data: {
        action: 'DEADLINE_UPDATE',
        details: `[PLAZO ACTUALIZADO] El plazo ha sido modificado por ${actor.name} a: ${formattedDeadline}.`,
        incidentTaskId: taskId,
        userId: actorId,
      }
    });

    if (updatedTask.assignedTo) {
      await tx.notification.create({
        data: {
          message: `El plazo para tu tarea "${updatedTask.title}" ha sido actualizado por el administrador.`,
          tenantId: updatedTask.tenantId,
          userId: updatedTask.assignedTo.id,
          parentNotificationId: updatedTask.notificationId,
        }
      });
    }

    return updatedTask;
  });
};