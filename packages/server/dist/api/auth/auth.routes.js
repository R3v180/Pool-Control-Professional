import { Router } from 'express';
import { registerHandler, loginHandler, getMeHandler, } from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
const authRouter = Router();
/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
authRouter.post('/register', registerHandler);
/**
 * @route   POST /api/auth/login
 * @desc    Inicia sesión y devuelve un token en una cookie
 * @access  Public
 */
authRouter.post('/login', loginHandler);
/**
 * @route   GET /api/auth/me
 * @desc    Obtiene los datos del usuario logueado a partir de su token
 * @access  Private
 */
authRouter.get('/me', protect, getMeHandler);
/**
 * @route   POST /api/auth/logout
 * @desc    Cierra la sesión del usuario eliminando la cookie
 * @access  Public
 */
authRouter.post('/logout', (_req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.status(200).json({ success: true, message: 'Sesión cerrada con éxito.' });
});
export default authRouter;
