import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage.js';
import { TenantsPage } from '../features/superadmin/pages/TenantsPage.js';
import {
  AppLayout,
  ProtectedRoute,
  SuperAdminRoute,
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
        ],
      },
    ],
  },
]);