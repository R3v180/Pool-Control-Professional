// filename: packages/server/src/api/payments/payments.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP del CRUD de pagos.
import { createPayment, getPaymentsByClient, deletePayment, } from './payments.service.js';
/**
 * Maneja la creación de un nuevo pago.
 */
export const createPaymentHandler = async (req, res, next) => {
    try {
        // TODO: Validar que el clientId del body pertenece al tenant del usuario.
        const newPayment = await createPayment(req.body);
        res.status(201).json({ success: true, data: newPayment });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de todos los pagos de un cliente.
 */
export const getPaymentsByClientHandler = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).json({ success: false, message: 'El ID del cliente es requerido.' });
        }
        // TODO: Validar que el cliente pertenece al tenant del usuario.
        const payments = await getPaymentsByClient(clientId);
        res.status(200).json({ success: true, data: payments });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la eliminación de un pago.
 */
export const deletePaymentHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID del pago es requerido.' });
        }
        // TODO: Validar que el pago pertenece a un cliente del tenant del usuario.
        await deletePayment(id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
