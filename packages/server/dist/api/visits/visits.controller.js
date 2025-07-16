// filename: packages/server/src/api/visits/visits.controller.ts
// version: 1.9.3 (FIXED)
// description: Se corrige el manejador getScheduledVisitsForWeekHandler para procesar correctamente los arrays de filtros desde req.query.
import { getScheduledVisitsForWeek, assignTechnicianToVisit, getVisitsForTechnicianOnDate, getVisitDetails, submitWorkOrder, createSpecialVisit, rescheduleVisit, } from './visits.service.js';
/**
 * Maneja la obtención de las visitas programadas para un rango de fechas.
 */
export const getScheduledVisitsForWeekHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ message: 'Acción no permitida.' });
        }
        // ✅ CORRECCIÓN: Procesar correctamente los parámetros de la query
        const { startDate: startDateStr, endDate: endDateStr, technicianIds, zoneIds } = req.query;
        if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
            return res.status(400).json({ message: 'Los parámetros startDate y endDate son obligatorios.' });
        }
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        // Asegurarse de que los filtros de ID son arrays, incluso si solo llega uno.
        const techIdsArray = Array.isArray(technicianIds) ? technicianIds : (typeof technicianIds === 'string' ? [technicianIds] : undefined);
        const zoneIdsArray = Array.isArray(zoneIds) ? zoneIds : (typeof zoneIds === 'string' ? [zoneIds] : undefined);
        const visits = await getScheduledVisitsForWeek(tenantId, startDate, endDate, techIdsArray, zoneIdsArray);
        res.status(200).json({ success: true, data: visits });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la asignación de un técnico a una visita.
 */
export const assignTechnicianHandler = async (req, res, next) => {
    try {
        const { visitId, technicianId } = req.body;
        if (!visitId) {
            return res.status(400).json({ message: 'visitId es requerido.' });
        }
        const assignedVisit = await assignTechnicianToVisit(visitId, technicianId);
        res.status(200).json({ success: true, data: assignedVisit });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la reprogramación de una visita (fecha y/o técnico).
 */
export const rescheduleVisitHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { timestamp, technicianId } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID de la visita es requerido.' });
        }
        if (!timestamp) {
            return res.status(400).json({ success: false, message: 'El campo timestamp es obligatorio.' });
        }
        const updatedVisit = await rescheduleVisit(id, { timestamp, technicianId });
        res.status(200).json({ success: true, data: updatedVisit });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de la ruta diaria para el técnico autenticado.
 */
export const getMyRouteHandler = async (req, res, next) => {
    try {
        const technicianId = req.user?.id;
        if (!technicianId || (req.user?.role !== 'TECHNICIAN' && req.user?.role !== 'MANAGER')) {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }
        const today = new Date();
        const visits = await getVisitsForTechnicianOnDate(technicianId, today);
        res.status(200).json({ success: true, data: visits });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de los detalles de una visita específica.
 */
export const getVisitDetailsHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID de la visita es requerido.' });
        }
        const visitDetails = await getVisitDetails(id);
        if (!visitDetails) {
            return res.status(404).json({ message: 'Visita no encontrada.' });
        }
        res.status(200).json({ success: true, data: visitDetails });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja el envío de un parte de trabajo.
 */
export const submitWorkOrderHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID de la visita es requerido.' });
        }
        await submitWorkOrder(id, req.body);
        res.status(200).json({ success: true, message: 'Parte de trabajo guardado con éxito.' });
    }
    catch (error) {
        console.error('ERROR AL PROCESAR PARTE DE TRABAJO:', error);
        next(error);
    }
};
/**
 * Maneja la creación de una visita especial (Orden de Trabajo Especial).
 */
export const createSpecialVisitHandler = async (req, res, next) => {
    try {
        const { poolId, timestamp } = req.body;
        if (!poolId || !timestamp) {
            return res.status(400).json({ success: false, message: 'Los campos poolId y timestamp son obligatorios.' });
        }
        const newVisit = await createSpecialVisit(req.body);
        res.status(201).json({ success: true, data: newVisit });
    }
    catch (error) {
        next(error);
    }
};
