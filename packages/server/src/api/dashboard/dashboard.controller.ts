// filename: packages/server/src/api/dashboard/dashboard.controller.ts
// version: 1.0.1 (FIXED)
// description: Añade la guarda de validación para req.user.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getManagerDashboardData } from './dashboard.service.js';

/**
 * Maneja la obtención de todos los datos agregados para el dashboard del manager.
 */
export const getManagerDashboardHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // --- ✅ GUARDA DE VALIDACIÓN AÑADIDA ---
    // Aseguramos que el usuario y el tenantId existen.
    // Aunque 'protect' ya lo hace, esto satisface a TypeScript.
    if (!req.user || !req.user.tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida. Usuario o Tenant no identificado.' });
    }
    
    const tenantId = req.user.tenantId;

    // Solo los roles MANAGER pueden acceder a este dashboard.
    // El 'activeRole' del frontend no importa aquí, miramos el rol real.
    if (req.user.role !== 'MANAGER' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de Manager.'})
    }
    
    const dashboardData = await getManagerDashboardData(tenantId);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    next(error);
  }
};