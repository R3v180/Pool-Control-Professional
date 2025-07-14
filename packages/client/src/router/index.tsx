// filename: packages/client/src/router/index.tsx
// Version: 2.1.1 (FIXED)
// description: Versión completa y correcta del enrutador con el ManagerDashboard.
import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage.js';
import { TenantsPage } from '../features/superadmin/pages/TenantsPage.js';
import { ParameterCatalogPage } from '../features/admin/pages/ParameterCatalogPage.js';
import { TaskCatalogPage } from '../features/admin/pages/TaskCatalogPage.js';
import { ProductCatalogPage } from '../features/admin/pages/ProductCatalogPage.js';
import { ClientsPage } from '../features/admin/pages/clients/ClientsPage.js';
import { ClientDetailPage } from '../features/admin/pages/clients/ClientDetailPage.js';
import { PoolDetailPage } from '../features/admin/pages/pools/PoolDetailPage.js';
import { PlannerPage } from '../features/admin/pages/planner/PlannerPage.js';
import { MyRoutePage } from '../features/technician/pages/MyRoutePage.js';
import { WorkOrderPage } from '../features/technician/pages/WorkOrderPage.js';
import { AdminDashboard } from '../features/admin/pages/AdminDashboard.js';
import { IncidentsHistoryPage } from '../features/admin/pages/IncidentsHistoryPage.js';
import { IncidentDetailPage } from '../features/admin/pages/incidents/IncidentDetailPage.js';
import { ManagerDashboard } from '../features/manager/pages/ManagerDashboard.js';
import { useAuth } from '../providers/AuthProvider.js';
import {
  AppLayout,
  ProtectedRoute,
  SuperAdminRoute,
  AdminRoute,
  TechnicianRoute,
} from './components.js';

// --- Componente Despachador de Dashboard ---
const RoleBasedDashboard = () => {
  const { activeRole, user } = useAuth();

  if (user?.role === 'SUPER_ADMIN') {
    return <TenantsPage />;
  }

  switch (activeRole) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TECHNICIAN':
      return <MyRoutePage />;
    case 'MANAGER':
      return <ManagerDashboard />;
    default:
      return <div>Cargando...</div>;
  }
};


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
            element: <RoleBasedDashboard />,
          },
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
            path: 'incidents-history',
            element: <AdminRoute />,
            children: [
              {
                index: true,
                element: <IncidentsHistoryPage />,
              },
            ],
          },
          {
            path: 'incidents/:notificationId',
            element: <ProtectedRoute />,
            children: [
              {
                index: true,
                element: <IncidentDetailPage />,
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
              {
                path: 'products',
                element: <ProductCatalogPage />,
              },
            ],
          },
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
          {
            path: 'visits/:visitId',
            element: <ProtectedRoute />,
            children: [
              {
                index: true,
                element: <WorkOrderPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);