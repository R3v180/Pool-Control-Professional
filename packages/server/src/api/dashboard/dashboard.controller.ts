// ====== [58] packages/server/src/api/dashboard/dashboard.controller.ts ======
// filename: packages/server/src/api/dashboard/dashboard.controller.ts
// version: 2.0.0 (FEAT: Handle date range parameters from query)
// description: The controller now reads startDate and endDate from the query string, providing a default if they are absent.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getManagerDashboardData } from './dashboard.service.js';
// ✅ 1. Importar utilidades de fecha para el rango por defecto
import { subDays, endOfDay } from 'date-fns';

/**
 * Maneja la obtención de todos los datos agregados para el dashboard del manager.
 */
export const getManagerDashboardHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida. Usuario o Tenant no identificado.' });
    }
    
    const tenantId = req.user.tenantId;

    if (req.user.role !== 'MANAGER' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de Manager.'})
    }

    // ✅ 2. Leer los parámetros de fecha de la query string
    const { startDate: startDateStr, endDate: endDateStr } = req.query;

    let startDate: Date;
    let endDate: Date;

    // ✅ 3. Establecer rango por defecto si no se proporcionan fechas
    if (startDateStr && endDateStr && typeof startDateStr === 'string' && typeof endDateStr === 'string') {
        startDate = new Date(startDateStr);
        endDate = new Date(endDateStr);
        
        // ✅ 4. Validar las fechas recibidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Formato de fecha inválido.' });
        }
    } else {
        // Rango por defecto: últimos 30 días
        const today = new Date();
        startDate = subDays(today, 30);
        endDate = endOfDay(today); // Aseguramos que incluya todo el día de hoy
    }
    
    // ✅ 5. Pasar el rango de fechas al servicio
    const dashboardData = await getManagerDashboardData(tenantId, startDate, endDate);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    next(error);
  }
};