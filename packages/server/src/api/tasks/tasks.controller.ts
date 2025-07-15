// filename: packages/server/src/api/tasks/tasks.controller.ts
// Version: 2.0.0 (FEAT: Pass tenantId to service for validation)

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
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
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
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
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
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de plantilla o de tenant faltante.' });
    }
    
    const updatedTemplate = await updateTaskTemplate(id, tenantId, req.body);
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
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de plantilla o de tenant faltante.' });
    }

    await deleteTaskTemplate(id, tenantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};