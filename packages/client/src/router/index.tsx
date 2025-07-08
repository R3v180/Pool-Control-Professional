// filename: packages/client/src/router/index.tsx
// Version: 1.4.2 (Align with final folder structure for client pages)
import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage.js';
import { TenantsPage } from '../features/superadmin/pages/TenantsPage.js';
import { ParameterCatalogPage } from '../features/admin/pages/ParameterCatalogPage.js';
import { TaskCatalogPage } from '../features/admin/pages/TaskCatalogPage.js';
import { ClientsPage } from '../features/admin/pages/clients/ClientsPage.js';
import { ClientDetailPage } from '../features/admin/pages/clients/ClientDetailPage.js';
import {
  AppLayout,
  ProtectedRoute,
  SuperAdminRoute,
  AdminRoute,
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
        ],
      },
    ],
  },
]);