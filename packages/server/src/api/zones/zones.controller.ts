// filename: packages/server/src/api/zones/zones.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP del CRUD de Zonas.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createZone,
  getZonesByTenant,
  updateZone,
  deleteZone,
} from './zones.service.js';

/**
 * Maneja la creación de una nueva zona.
 */
export const createZoneHandler = async (
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
    const newZone = await createZone(input);
    res.status(201).json({ success: true, data: newZone });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todas las zonas de un tenant.
 */
export const getZonesByTenantHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }
    const zones = await getZonesByTenant(tenantId);
    res.status(200).json({ success: true, data: zones });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de una zona.
 */
export const updateZoneHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de zona o de tenant faltante.' });
    }
    
    const updatedZone = await updateZone(id, tenantId, req.body);
    res.status(200).json({ success: true, data: updatedZone });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de una zona.
 */
export const deleteZoneHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!id || !tenantId) {
      return res.status(400).json({ success: false, message: 'ID de zona o de tenant faltante.' });
    }

    await deleteZone(id, tenantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};