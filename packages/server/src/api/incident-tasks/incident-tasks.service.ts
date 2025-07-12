// filename: packages/server/src/api/incident-tasks/incident-tasks.service.ts
// version: 1.2.1 (FIXED - Removed unused actorId parameter)

import { PrismaClient } from '@prisma/client';
import type { IncidentTask, IncidentPriority, IncidentTaskStatus, IncidentTaskLog } from '@prisma/client';

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
  return prisma.incidentTask.findMany({ where: { notificationId, tenantId }, include: { assignedTo: { select: { id: true, name: true, }, }, }, orderBy: { createdAt: 'asc', }, });
};
export const getTasksAssignedToUser = async (userId: string): Promise<IncidentTask[]> => {
  return prisma.incidentTask.findMany({ where: { assignedToId: userId, status: { in: ['PENDING', 'IN_PROGRESS'], }, }, include: { notification: { include: { visit: { include: { pool: { select: { name: true } } } } } } }, orderBy: { priority: 'desc', }, });
};

// --- CORRECCIÓN: Se elimina el parámetro `actorId` no utilizado ---
export const updateIncidentTask = async (id: string, data: UpdateIncidentTaskInput): Promise<IncidentTask> => {
    return prisma.incidentTask.update({
        where: { id },
        data,
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
        }
      });
    }
    return task;
  });
};

export const addTaskLog = async (taskId: string, actorId: string, data: AddLogInput) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.incidentTask.update({
      where: { id: taskId },
      data: { deadline: data.newDeadline ? new Date(data.newDeadline) : undefined },
      include: { assignedTo: true, notification: true },
    });

    if (!task.assignedTo) throw new Error("La tarea no tiene un asignado.");

    const log = await tx.incidentTaskLog.create({
      data: {
        action: 'COMMENT',
        details: data.details,
        incidentTaskId: taskId,
        userId: actorId,
      }
    });

    await tx.notification.create({
      data: {
        message: `Actualización de ${task.assignedTo.name} en la tarea "${task.title}": ${data.details}`,
        tenantId: task.tenantId,
        userId: task.notification.userId,
      }
    });

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