// filename: packages/server/src/api/reports/reports.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP de informes.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import { generateConsumptionReport } from './reports.service.js';

/**
 * Maneja la petición para generar y devolver un informe de consumo.
 */
export const getConsumptionReportHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extraer y validar el tenantId del usuario autenticado
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida. Tenant no identificado.' });
    }

    // 2. Extraer y validar los parámetros de la consulta (filtros)
    const { startDate: startDateStr, endDate: endDateStr, clientId } = req.query;

    if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
      return res.status(400).json({ success: false, message: 'Los parámetros startDate y endDate son obligatorios.' });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Comprobar que las fechas sean válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'El formato de las fechas no es válido.' });
    }

    // 3. Llamar al servicio con los filtros validados
    const report = await generateConsumptionReport({
      tenantId,
      startDate,
      endDate,
      clientId: typeof clientId === 'string' ? clientId : undefined,
    });

    // 4. Devolver el informe generado
    res.status(200).json({ success: true, data: report });

  } catch (error) {
    // Si algo falla en el servicio, se pasa al manejador de errores global
    next(error);
  }
};