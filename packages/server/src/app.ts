// filename: packages/server/src/app.ts
// version: 2.1.0 (Mount uploadsRouter)
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
import visitsRouter from './api/visits/visits.routes.js';
import usersRouter from './api/users/users.routes.js';
import notificationsRouter from './api/notifications/notifications.routes.js';
import productsRouter from './api/products/products.routes.js';
import incidentTasksRouter from './api/incident-tasks/incident-tasks.routes.js';
import uploadsRouter from './api/uploads/uploads.routes.js'; // <-- 1. Importar

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

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/parameters', parametersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/pools', poolsRouter);
app.use('/api/pool-configurations', poolConfigurationsRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/products', productsRouter);
app.use('/api/incident-tasks', incidentTasksRouter);
app.use('/api/uploads', uploadsRouter); // <-- 2. Montar

// --- Gestor de Errores ---
app.use(errorHandler);

export default app;