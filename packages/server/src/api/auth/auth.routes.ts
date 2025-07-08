import { Router } from 'express';
import { registerHandler, loginHandler } from './auth.controller.js';

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

export default authRouter;