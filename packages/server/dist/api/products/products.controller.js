// filename: packages/server/src/api/products/products.controller.ts
// version: 2.0.0 (FEAT: Pass tenantId to service for validation)
import { createProduct, getProductsByTenant, updateProduct, deleteProduct, } from './products.service.js';
/**
 * Maneja la creación de un nuevo producto.
 */
export const createProductHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const input = { ...req.body, tenantId };
        const newProduct = await createProduct(input);
        res.status(201).json({ success: true, data: newProduct });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención de todos los productos de un tenant.
 */
export const getProductsHandler = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }
        const products = await getProductsByTenant(tenantId);
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la actualización de un producto.
 */
export const updateProductHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de producto o de tenant faltante.' });
        }
        // Pasamos el tenantId al servicio para la validación de pertenencia.
        const updatedProduct = await updateProduct(id, tenantId, req.body);
        res.status(200).json({ success: true, data: updatedProduct });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la eliminación de un producto.
 */
export const deleteProductHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;
        if (!id || !tenantId) {
            return res.status(400).json({ success: false, message: 'ID de producto o de tenant faltante.' });
        }
        // Pasamos el tenantId al servicio para la validación de pertenencia.
        await deleteProduct(id, tenantId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
