// filename: packages/server/src/api/reports/reports.controller.ts
// version: 1.2.0 (FEAT: Add handler for invoicing report)

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
// --- 1. Importar la nueva función del servicio ---
import { generateConsumptionReport, getConsumptionDetailsForProduct, generateInvoicingReport } from './reports.service.js';

/**
 * Maneja la petición para generar y devolver un informe de consumo (costes).
 */
export const getConsumptionReportHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida. Tenant no identificado.' });
    }

    const { startDate: startDateStr, endDate: endDateStr, clientId } = req.query;

    if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
      return res.status(400).json({ success: false, message: 'Los parámetros startDate y endDate son obligatorios.' });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'El formato de las fechas no es válido.' });
    }

    const report = await generateConsumptionReport({
      tenantId,
      startDate,
      endDate,
      clientId: typeof clientId === 'string' ? clientId : undefined,
    });

    res.status(200).json({ success: true, data: report });

  } catch (error) {
    next(error);
  }
};


/**
 * Maneja la petición para obtener el detalle de las visitas donde se consumió un producto.
 */
export const getProductConsumptionDetailHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida. Tenant no identificado.' });
        }

        const { startDate: startDateStr, endDate: endDateStr, clientId, productId } = req.query;

        if (!startDateStr || !endDateStr || !clientId || !productId || 
            typeof startDateStr !== 'string' || typeof endDateStr !== 'string' ||
            typeof clientId !== 'string' || typeof productId !== 'string') {
            return res.status(400).json({ success: false, message: 'Los parámetros startDate, endDate, clientId y productId son obligatorios.' });
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ success: false, message: 'El formato de las fechas no es válido.' });
        }

        const details = await getConsumptionDetailsForProduct({
            tenantId,
            startDate,
            endDate,
            clientId,
            productId,
        });

        res.status(200).json({ success: true, data: details });

    } catch (error) {
        next(error);
    }
};

/**
 * --- ✅ 2. NUEVO MANEJADOR ---
 * Maneja la petición para generar y devolver un informe de pre-facturación.
 */
export const getInvoicingReportHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida. Tenant no identificado.' });
        }

        const { startDate: startDateStr, endDate: endDateStr, clientId } = req.query;

        if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
            return res.status(400).json({ success: false, message: 'Los parámetros startDate y endDate son obligatorios.' });
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ success: false, message: 'El formato de las fechas no es válido.' });
        }

        const report = await generateInvoicingReport({
            tenantId,
            startDate,
            endDate,
            clientId: typeof clientId === 'string' ? clientId : undefined,
        });

        res.status(200).json({ success: true, data: report });

    } catch (error) {
        next(error);
    }
};