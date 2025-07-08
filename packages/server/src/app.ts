import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/error.middleware.js';
import authRouter from './api/auth/auth.routes.js';

// --- Instancia de la App ---
const app = express();

// --- Middlewares Esenciales ---

// 1. CORS (Cross-Origin Resource Sharing)
// Permite que nuestro frontend (en otro dominio/puerto) se comunique con este backend.
// 'credentials: true' es crucial para que permita el envío de cookies.
app.use(cors({
  origin: 'http://localhost:5173', // La URL por defecto del cliente de React/Vite
  credentials: true,
}));

// 2. Cookie Parser
// Parsea las cookies de las peticiones entrantes y las popula en `req.cookies`.
app.use(cookieParser());

// 3. JSON Body Parser
// Parsea el cuerpo de las peticiones entrantes con formato JSON (req.body).
app.use(express.json());


// --- Rutas de la API ---

// Ruta de health-check para verificar que el servidor está vivo.
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Montamos el enrutador de autenticación bajo el prefijo '/api/auth'
app.use('/api/auth', authRouter);


// --- Gestor de Errores ---
// Este debe ser el ÚLTIMO middleware que se añade.
// Atrapa todos los errores pasados a través de `next(error)`.
app.use(errorHandler);

export default app;