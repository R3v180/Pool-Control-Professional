// filename: packages/server/src/api/products/products.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP del catálogo de productos.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createProduct,
  getProductsByTenant,
  updateProduct,
  deleteProduct,
} from './products.service.js';

/**
 * Maneja la creación de un nuevo producto.
 */
export const createProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }

    // El tenantId se añade al cuerpo de la petición para asegurar la pertenencia.
    const input = { ...req.body, tenantId };
    const newProduct = await createProduct(input);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todos los productos de un tenant.
 */
export const getProductsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }

    const products = await getProductsByTenant(tenantId);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de un producto.
 */
export const updateProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID del producto es requerido.' });
    }
    
    const updatedProduct = await updateProduct(id, req.body);
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de un producto.
 */
export const deleteProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID del producto es requerido.' });
    }

    await deleteProduct(id);
    res.status(204).send(); // 204 No Content es la respuesta estándar para un DELETE exitoso.
  } catch (error) {
    // Si Prisma lanza un error de restricción de clave foránea (P2003),
    // el errorHandler global lo capturará. Podríamos añadir un manejo más específico aquí si quisiéramos.
    next(error);
  }
};