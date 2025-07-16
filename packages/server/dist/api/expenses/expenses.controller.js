// filename: packages/server/src/api/expenses/expenses.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP del CRUD de gastos.
import { createExpense, getExpensesByTenant, deleteExpense, } from './expenses.service.js';
/**
 * Maneja la creación de un nuevo gasto.
 */
export const createExpenseHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const input = { ...req.body, tenantId };
        const newExpense = await createExpense(input);
        res.status(201).json({ success: true, data: newExpense });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de todos los gastos de un tenant.
 */
export const getExpensesByTenantHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const expenses = await getExpensesByTenant(tenantId);
        res.status(200).json({ success: true, data: expenses });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la eliminación de un gasto.
 */
export const deleteExpenseHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'El ID del gasto es requerido.' });
        }
        // TODO: Validar que el gasto pertenece al tenant del usuario.
        await deleteExpense(id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
