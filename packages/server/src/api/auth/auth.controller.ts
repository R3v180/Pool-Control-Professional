import type { Request, Response, NextFunction } from 'express';
import { register, login } from './auth.service.js';
import { signToken } from '../../utils/jwt.utils.js';
import config from '../../config/index.js';
import type { CookieOptions } from 'express';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: config.JWT_EXPIRES_IN * 1000, // maxAge está en milisegundos
};

/**
 * Maneja la petición de registro de un nuevo usuario.
 */
export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await register(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Si el servicio lanza un error (ej. email duplicado),
    // lo pasamos a nuestro gestor de errores global.
    next(error);
  }
};

/**
 * Maneja la petición de login de un usuario.
 */
export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Validar credenciales con el servicio
    const user = await login(req.body);

    // 2. Crear el token JWT
    const token = signToken({ id: user.id, role: user.role });

    // 3. Establecer la cookie en la respuesta
    res.cookie('token', token, cookieOptions);

    // 4. Enviar la respuesta con los datos del usuario
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Si el servicio lanza un error (ej. credenciales incorrectas),
    // lo pasamos a nuestro gestor de errores global.
    next(error);
  }
};