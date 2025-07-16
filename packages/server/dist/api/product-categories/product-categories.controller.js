// filename: packages/server/src/api/product-categories/product-categories.controller.ts
// version: 2.0.0 (FEAT: Pass tenantId to service for validation)
import { createProductCategory, getProductCategoriesByTenant, updateProductCategory, deleteProductCategory, } from './product-categories.service.js';
/**
 * Maneja la creación de una nueva categoría de producto.
 */
export const createProductCategoryHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const input = { ...req.body, tenantId };
        const newCategory = await createProductCategory(input);
        res.status(201).json({ success: true, data: newCategory });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de todas las categorías de un tenant.
 */
export const getProductCategoriesHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const categories = await getProductCategoriesByTenant(tenantId);
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la actualización de una categoría de producto.
 */
export const updateProductCategoryHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de categoría o de tenant faltante.' });
        }
        const updatedCategory = await updateProductCategory(id, tenantId, req.body);
        res.status(200).json({ success: true, data: updatedCategory });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la eliminación de una categoría de producto.
 */
export const deleteProductCategoryHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de categoría o de tenant faltante.' });
        }
        await deleteProductCategory(id, tenantId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
