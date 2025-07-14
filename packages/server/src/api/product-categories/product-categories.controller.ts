// filename: packages/server/src/api/product-categories/product-categories.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP del CRUD de categorías de productos.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createProductCategory,
  getProductCategoriesByTenant,
  updateProductCategory,
  deleteProductCategory,
} from './product-categories.service.js';

/**
 * Maneja la creación de una nueva categoría de producto.
 */
export const createProductCategoryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }

    const input = { ...req.body, tenantId };
    const newCategory = await createProductCategory(input);
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todas las categorías de un tenant.
 */
export const getProductCategoriesHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }

    const categories = await getProductCategoriesByTenant(tenantId);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de una categoría de producto.
 */
export const updateProductCategoryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID de la categoría es requerido.' });
    }
    
    const updatedCategory = await updateProductCategory(id, req.body);
    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de una categoría de producto.
 */
export const deleteProductCategoryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID de la categoría es requerido.' });
    }

    await deleteProductCategory(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};