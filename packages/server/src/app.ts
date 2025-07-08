import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/error.middleware.js';
import authRouter from './api/auth/auth.routes.js';
import tenantsRouter from './api/tenants/tenants.routes.js';

// --- Instancia de la App ---
const app = express();

// --- Middlewares Esenciales ---
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());


// --- Rutas de la API ---

// Ruta de health-check para verificar que el servidor está vivo.
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Montamos los enrutadores de cada módulo
app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);


// --- Gestor de Errores ---
app.use(errorHandler);

export default app;