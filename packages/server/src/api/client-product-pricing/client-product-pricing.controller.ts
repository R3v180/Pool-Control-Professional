// filename: packages/server/src/api/client-product-pricing/client-product-pricing.controller.ts
// version: 1.0.0
// description: Controlador para manejar las peticiones HTTP del CRUD de reglas de precios.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  createPricingRule,
  getPricingRulesByClient,
  updatePricingRule,
  deletePricingRule,
} from './client-product-pricing.service.js';

/**
 * Maneja la creación de una nueva regla de precios.
 */
export const createPricingRuleHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Aquí el clientId vendrá en el cuerpo de la petición.
    // Podríamos añadir una validación para asegurar que el cliente pertenece al tenant del usuario.
    const newRule = await createPricingRule(req.body);
    res.status(201).json({ success: true, data: newRule });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la obtención de todas las reglas de precios de un cliente.
 */
export const getPricingRulesByClientHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientId } = req.params;
    if (!clientId) {
      return res.status(400).json({ success: false, message: 'El ID del cliente es requerido.' });
    }
    // TODO: Validar que el cliente pertenece al tenant del usuario.
    const rules = await getPricingRulesByClient(clientId);
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la actualización de una regla de precios.
 */
export const updatePricingRuleHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID de la regla es requerido.' });
    }
    // TODO: Validar que la regla pertenece a un cliente del tenant del usuario.
    const updatedRule = await updatePricingRule(id, req.body);
    res.status(200).json({ success: true, data: updatedRule });
  } catch (error) {
    next(error);
  }
};

/**
 * Maneja la eliminación de una regla de precios.
 */
export const deletePricingRuleHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID de la regla es requerido.' });
    }
    // TODO: Validar que la regla pertenece a un cliente del tenant del usuario.
    await deletePricingRule(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};