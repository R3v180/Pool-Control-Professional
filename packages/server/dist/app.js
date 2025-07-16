// filename: packages/server/src/app.ts
// version: 3.0.0 (FEAT: Mount planningRouter)
import express from 'express';
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
import uploadsRouter from './api/uploads/uploads.routes.js';
import productCategoriesRouter from './api/product-categories/product-categories.routes.js';
import clientProductPricingRouter from './api/client-product-pricing/client-product-pricing.routes.js';
import paymentsRouter from './api/payments/payments.routes.js';
import expensesRouter from './api/expenses/expenses.routes.js';
import dashboardRouter from './api/dashboard/dashboard.routes.js';
import reportsRouter from './api/reports/reports.routes.js';
import zonesRouter from './api/zones/zones.routes.js';
import routeTemplatesRouter from './api/route-templates/route-templates.routes.js';
// ✅ 1. Importar el nuevo router
import planningRouter from './api/planning/planning.routes.js';
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.get('/api/health', (_req, res) => {
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
app.use('/api/uploads', uploadsRouter);
app.use('/api/product-categories', productCategoriesRouter);
app.use('/api/client-product-pricing', clientProductPricingRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/route-templates', routeTemplatesRouter);
// ✅ 2. Montar el nuevo router
app.use('/api/planning', planningRouter);
app.use(errorHandler);
export default app;
