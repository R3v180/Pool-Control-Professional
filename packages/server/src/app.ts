// filename: packages/server/src/app.ts
// Version: 1.5.0 (Mount poolConfigurationsRouter for Admin module)
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/error.middleware.js';
import authRouter from './api/auth/auth.routes.js';
import tenantsRouter from './api/tenants/tenants.routes.js';
import parametersRouter from './api/parameters/parameters.routes.js';
import tasksRouter from './api/tasks/tasks.routes.js';
import clientsRouter from './api/clients/clients.routes.js';
import poolsRouter from './api/pools/pools.routes.js';
import poolConfigurationsRouter from './api/pool-configurations/pool-configurations.routes.js';

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
app.use('/api/parameters', parametersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/pools', poolsRouter);
app.use('/api/pool-configurations', poolConfigurationsRouter);


// --- Gestor de Errores ---
app.use(errorHandler);

export default app;