import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import { verifyToken } from '../utils/jwt.utils.js';

const prisma = new PrismaClient();

// Creamos un tipo "seguro" para el usuario, omitiendo la contraseña.
type SafeUser = Omit<User, 'password'>;

// Extendemos la interfaz Request de Express para que use nuestro tipo SafeUser.
export interface AuthRequest extends Request {
  user?: SafeUser;
}

/**
 * Middleware para proteger rutas. Verifica el token JWT de la cookie.
 * Si el token es válido, adjunta el usuario a la request y pasa al siguiente middleware.
 * Si no, devuelve un error 401 (No autorizado).
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
      // Seleccionamos todos los campos EXCEPTO la contraseña.
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'No autenticado: usuario no encontrado.' });
    }

    // Ahora `user` coincide con el tipo `SafeUser`, por lo que la asignación es válida.
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autenticado: error en la validación.' });
  }
};