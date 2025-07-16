// filename: packages/server/src/middleware/auth.middleware.ts
// version: 2.0.1 (FIXED)
// description: Se añade 'isAvailable' a la consulta del usuario para que el objeto 'user' esté completo.

import type { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { verifyToken } from '../utils/jwt.utils.js';

const prisma = new PrismaClient();

type SafeUser = Omit<User, 'password'>;

export interface AuthRequest extends Request {
  user?: SafeUser;
}

/**
 * Middleware para proteger rutas. Verifica el token JWT y maneja la suplantación de rol.
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado: no hay token.' });
  }

  try {
    const decoded = verifyToken<{ id: string }>(token);

    if (!decoded) {
      return res.status(401).json({ message: 'No autenticado: token inválido.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        isAvailable: true, // ✅ CORRECCIÓN: Añadido el campo que faltaba.
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'No autenticado: usuario no encontrado.' });
    }
    
    const viewAsRoleHeader = req.headers['x-view-as-role'] as UserRole | undefined;

    if (user.role === 'MANAGER' && viewAsRoleHeader) {
      const allowedViews: UserRole[] = ['ADMIN', 'TECHNICIAN'];
      if (allowedViews.includes(viewAsRoleHeader)) {
        user.role = viewAsRoleHeader;
      }
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autenticado: error en la validación.' });
  }
};