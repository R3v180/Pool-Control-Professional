// filename: packages/server/src/api/route-templates/route-templates.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP del CRUD de Rutas Maestras.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createRouteTemplate,
  getRouteTemplatesByTenant,
  getRouteTemplateById,
  updateRouteTemplate,
  deleteRouteTemplate,
} from './route-templates.service.js';

/**
 * Maneja la creación de una nueva Ruta Maestra.
 */
export const createRouteTemplateHandler = async (
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
    const newRouteTemplate = await createRouteTemplate(input);
    res.status(201).json({ success: true, data: newRouteTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todas las Rutas Maestras de un tenant.
 */
export const getRouteTemplatesHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }
    const routeTemplates = await getRouteTemplatesByTenant(tenantId);
    res.status(200).json({ success: true, data: routeTemplates });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de una Ruta Maestra por su ID.
 */
export const getRouteTemplateByIdHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId || !id) {
        return res.status(400).json({ success: false, message: 'Falta el ID de la ruta o del tenant.' });
    }

    const routeTemplate = await getRouteTemplateById(id, tenantId);
    if (!routeTemplate) {
        return res.status(404).json({ success: false, message: 'Ruta Maestra no encontrada.' });
    }
    res.status(200).json({ success: true, data: routeTemplate });
  } catch (error) {
    next(error);
  }
};


/**
 * Maneja la actualización de una Ruta Maestra.
 */
export const updateRouteTemplateHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de ruta o de tenant faltante.' });
    }
    
    const updatedRouteTemplate = await updateRouteTemplate(id, tenantId, req.body);
    res.status(200).json({ success: true, data: updatedRouteTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de una Ruta Maestra.
 */
export const deleteRouteTemplateHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de ruta o de tenant faltante.' });
    }

    await deleteRouteTemplate(id, tenantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};