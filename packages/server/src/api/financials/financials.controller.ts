// filename: packages/server/src/api/financials/financials.controller.ts
// version: 1.0.0 (NEW)
// description: Nuevo controlador para manejar las peticiones HTTP relacionadas con los informes y datos financieros agregados.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { getAccountStatusByMonth } from './financials.service.js';

/**
 * Maneja la petición para obtener el estado de cuentas de todos los clientes
 * para un mes y año específicos.
 */
export const getAccountStatusHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida. Tenant no identificado.' });
    }

    const { date: dateStr } = req.query;
    if (!dateStr || typeof dateStr !== 'string') {
      return res.status(400).json({ success: false, message: 'El parámetro "date" es obligatorio.' });
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ success: false, message: 'El formato de la fecha no es válido.' });
    }

    const accountStatusData = await getAccountStatusByMonth(tenantId, date);
    res.status(200).json({ success: true, data: accountStatusData });

  } catch (error) {
    next(error);
  }
};