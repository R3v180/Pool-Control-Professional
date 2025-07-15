// filename: packages/server/src/api/parameters/parameters.controller.ts
// Version: 2.0.0 (FEAT: Pass tenantId to service for validation)

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createParameterTemplate,
  deleteParameterTemplate,
  getParameterTemplatesByTenant,
  updateParameterTemplate,
} from './parameters.service.js';

/**
 * Maneja la creación de una nueva plantilla de parámetro.
 */
export const createParameterTemplateHandler = async (
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
    const newTemplate = await createParameterTemplate(input);
    res.status(201).json({ success: true, data: newTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todas las plantillas de un tenant.
 */
export const getParameterTemplatesByTenantHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }
    const templates = await getParameterTemplatesByTenant(tenantId);
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de una plantilla de parámetro.
 */
export const updateParameterTemplateHandler = async (
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

    const updatedTemplate = await updateParameterTemplate(id, tenantId, req.body);
    res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de una plantilla de parámetro.
 */
export const deleteParameterTemplateHandler = async (
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

    await deleteParameterTemplate(id, tenantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};