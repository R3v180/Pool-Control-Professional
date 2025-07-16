import { register, login } from './auth.service.js';
import { signToken } from '../../utils/jwt.utils.js';
import config from '../../config/index.js';
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: config.JWT_EXPIRES_IN * 1000, // maxAge está en milisegundos
};
/**
 * Maneja la petición de registro de un nuevo usuario.
 */
export const registerHandler = async (req, res, next) => {
    try {
        const user = await register(req.body);
        res.status(201).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la petición de login de un usuario.
 */
export const loginHandler = async (req, res, next) => {
    try {
        const user = await login(req.body);
        const token = signToken({ id: user.id, role: user.role });
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Maneja la obtención del usuario actualmente autenticado (a través del token).
 */
export const getMeHandler = (req, res) => {
    // El middleware 'protect' se ejecuta antes que este manejador.
    // Si llega hasta aquí, significa que el token es válido y 'req.user' existe.
    res.status(200).json({
        success: true,
        data: req.user,
    });
};
