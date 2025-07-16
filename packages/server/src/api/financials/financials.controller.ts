// filename: packages/server/src/api/financials/financials.controller.ts
// version: 1.1.0 (FEAT: Handle date range parameters)
// description: Se actualiza el controlador para que acepte un rango de fechas (startDate, endDate) y llame a la nueva función de servicio `getAccountStatusByPeriod`.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
// ✅ Se importa la función con el nombre corregido
import { getAccountStatusByPeriod } from './financials.service.js';

/**
 * Maneja la petición para obtener el estado de cuentas de todos los clientes
 * para un período específico.
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

    // ✅ Se procesan startDate y endDate
    const { startDate: startDateStr, endDate: endDateStr } = req.query;
    if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
      return res.status(400).json({ success: false, message: 'Los parámetros "startDate" y "endDate" son obligatorios.' });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'El formato de las fechas no es válido.' });
    }

    // ✅ Se llama a la función correcta con los nuevos parámetros
    const accountStatusData = await getAccountStatusByPeriod(tenantId, startDate, endDate);
    res.status(200).json({ success: true, data: accountStatusData });

  } catch (error) {
    next(error);
  }
};