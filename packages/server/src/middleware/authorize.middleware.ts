// filename: packages/server/src/middleware/authorize.middleware.ts
// version: 1.0.0
// description: Middleware para la autorización basada en roles.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.js';
import type { UserRole } from '@prisma/client';

/**
 * Crea un middleware de Express que verifica si el rol del usuario autenticado
 * está incluido en la lista de roles permitidos.
 *
 * @param {...UserRole} allowedRoles - Una lista de roles que tienen permiso para acceder a la ruta.
 * @returns Un middleware de Express.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // El middleware 'protect' debe haberse ejecutado antes, por lo que 'req.user' debería existir.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado. Imposible realizar la autorización.',
      });
    }

    const { role } = req.user;

    // Comprobamos si el rol del usuario está en la lista de roles permitidos.
    // Importante: Esto comprueba el rol REAL del usuario en la DB, no el de la vista "Camaleón".
    // La lógica de la vista "Camaleón" ya se ha aplicado en el middleware `protect`.
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Tu rol ('${role}') no tiene permiso para este recurso. Roles permitidos: ${allowedRoles.join(', ')}.`,
      });
    }

    // Si el rol es válido, pasamos al siguiente middleware o al controlador de la ruta.
    next();
  };
};