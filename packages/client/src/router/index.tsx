// filename: packages/client/src/router/index.tsx
// Version: 1.7.0 (Add /my-route for Technician role)
import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage.js';
import { TenantsPage } from '../features/superadmin/pages/TenantsPage.js';
import { ParameterCatalogPage } from '../features/admin/pages/ParameterCatalogPage.js';
import { TaskCatalogPage } from '../features/admin/pages/TaskCatalogPage.js';
import { ClientsPage } from '../features/admin/pages/clients/ClientsPage.js';
import { ClientDetailPage } from '../features/admin/pages/clients/ClientDetailPage.js';
import { PoolDetailPage } from '../features/admin/pages/pools/PoolDetailPage.js';
import { PlannerPage } from '../features/admin/pages/planner/PlannerPage.js';
import { MyRoutePage } from '../features/technician/pages/MyRoutePage.js';
import {
  AppLayout,
  ProtectedRoute,
  SuperAdminRoute,
  AdminRoute,
  TechnicianRoute,
} from './components.js';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <div>Dashboard Principal</div>,
          },
          // --- Sección de SuperAdmin ---
          {
            path: 'superadmin',
            element: <SuperAdminRoute />,
            children: [
              {
                path: 'tenants',
                element: <TenantsPage />,
              },
            ],
          },
          // --- Sección de Administración ---
          {
            path: 'planner',
            element: <AdminRoute />,
            children: [
              {
                index: true,
                element: <PlannerPage />,
              },
            ],
          },
          {
            path: 'clients',
            element: <AdminRoute />,
            children: [
              {
                index: true,
                element: <ClientsPage />,
              },
              {
                path: ':id', 
                element: <ClientDetailPage />,
              },
            ],
          },
          {
            path: 'pools/:id', 
            element: <AdminRoute />,
            children: [
              {
                index: true,
                element: <PoolDetailPage />
              }
            ]
          },
          {
            path: 'catalog',
            element: <AdminRoute />,
            children: [
              {
                path: 'parameters',
                element: <ParameterCatalogPage />,
              },
              {
                path: 'tasks',
                element: <TaskCatalogPage />,
              },
            ],
          },
          // --- Sección de Técnico ---
          {
            path: 'my-route',
            element: <TechnicianRoute />,
            children: [
              {
                index: true,
                element: <MyRoutePage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);