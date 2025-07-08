// filename: packages/server/src/api/tasks/tasks.controller.ts
// Version: 1.0.0 (Initial creation of the controller for Scheduled Tasks)
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createTaskTemplate,
  deleteTaskTemplate,
  getTaskTemplatesByTenant,
  updateTaskTemplate,
} from './tasks.service.js';

/**
 * Maneja la creación de una nueva plantilla de tarea.
 */
export const createTaskTemplateHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const input = { ...req.body, tenantId };
    const newTemplate = await createTaskTemplate(input);
    res.status(201).json({ success: true, data: newTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todas las plantillas de tareas de un tenant.
 */
export const getTaskTemplatesByTenantHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Acción no permitida.' });
    }

    const templates = await getTaskTemplatesByTenant(tenantId);
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de una plantilla de tarea.
 */
export const updateTaskTemplateHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la plantilla es requerido.' });
    }
    // TODO: Verificar que la plantilla que se quiere editar pertenece al tenant del usuario logueado.

    const updatedTemplate = await updateTaskTemplate(id, req.body);
    res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de una plantilla de tarea.
 */
export const deleteTaskTemplateHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'El ID de la plantilla es requerido.' });
    }
    // TODO: Verificar que la plantilla que se quiere eliminar pertenece al tenant del usuario logueado.

    await deleteTaskTemplate(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};