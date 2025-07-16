// filename: packages/server/src/api/incident-tasks/incident-tasks.controller.ts
// version: 1.3.1 (Cleaned)
import { createIncidentTask, getTasksByNotificationId, updateIncidentTask, deleteIncidentTask, getTasksAssignedToUser, updateTaskStatus, addTaskLog, getTaskLogs, updateTaskDeadline, } from './incident-tasks.service.js';
export const getMyAssignedTasksHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
        }
        const tasks = await getTasksAssignedToUser(userId);
        res.status(200).json({ success: true, data: tasks });
    }
    catch (error) {
        next(error);
    }
};
export const createIncidentTaskHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        const actorId = req.user?.id;
        if (!tenantId || !actorId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida. Usuario o tenant no identificado.' });
        }
        const input = { ...req.body, tenantId };
        const newTask = await createIncidentTask(input, actorId);
        res.status(201).json({ success: true, data: newTask });
    }
    catch (error) {
        next(error);
    }
};
export const getTasksByNotificationHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const { notificationId } = req.params;
        if (!notificationId) {
            return res.status(400).json({ success: false, message: 'El ID de la notificación es requerido.' });
        }
        const tasks = await getTasksByNotificationId(notificationId, tenantId);
        res.status(200).json({ success: true, data: tasks });
    }
    catch (error) {
        next(error);
    }
};
export const updateIncidentTaskHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID de la tarea es requerido.' });
        }
        const updatedTask = await updateIncidentTask(id, req.body);
        res.status(200).json({ success: true, data: updatedTask });
    }
    catch (error) {
        next(error);
    }
};
export const deleteIncidentTaskHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID de la tarea es requerido.' });
        }
        await deleteIncidentTask(id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
export const updateTaskStatusHandler = async (req, res, next) => {
    try {
        const { id: taskId } = req.params;
        const actorId = req.user?.id;
        const { status, resolutionNotes } = req.body;
        if (!taskId) {
            return res.status(400).json({ success: false, message: 'El ID de la tarea es requerido.' });
        }
        if (!actorId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
        }
        if (!status) {
            return res.status(400).json({ success: false, message: 'El estado es requerido.' });
        }
        const updatedTask = await updateTaskStatus(taskId, actorId, status, resolutionNotes);
        res.status(200).json({ success: true, data: updatedTask });
    }
    catch (error) {
        next(error);
    }
};
export const addTaskLogHandler = async (req, res, next) => {
    try {
        const { id: taskId } = req.params;
        const actorId = req.user?.id;
        if (!taskId) {
            return res.status(400).json({ success: false, message: 'El ID de la tarea es requerido.' });
        }
        if (!actorId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
        }
        const log = await addTaskLog(taskId, actorId, req.body);
        res.status(201).json({ success: true, data: log });
    }
    catch (error) {
        next(error);
    }
};
export const getTaskLogsHandler = async (req, res, next) => {
    try {
        const { id: taskId } = req.params;
        if (!taskId) {
            return res.status(400).json({ success: false, message: 'El ID de la tarea es requerido.' });
        }
        const logs = await getTaskLogs(taskId);
        res.status(200).json({ success: true, data: logs });
    }
    catch (error) {
        next(error);
    }
};
export const updateTaskDeadlineHandler = async (req, res, next) => {
    try {
        const { id: taskId } = req.params;
        const actorId = req.user?.id;
        const { deadline } = req.body;
        if (!taskId) {
            return res.status(400).json({ success: false, message: 'El ID de la tarea es requerido.' });
        }
        if (!actorId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
        }
        if (typeof deadline !== 'string' || !deadline) {
            return res.status(400).json({ success: false, message: 'Se requiere un plazo (deadline) válido.' });
        }
        const updatedTask = await updateTaskDeadline(taskId, deadline, actorId);
        res.status(200).json({ success: true, data: updatedTask });
    }
    catch (error) {
        next(error);
    }
};
