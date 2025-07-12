// filename: packages/client/src/router/index.tsx
// Version: 1.9.1 (FIX: Allow technicians to access IncidentDetailPage)
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
import { useAuth } from '../providers/AuthProvider.js';
import {
  AppLayout,
  ProtectedRoute,
  SuperAdminRoute,
  AdminRoute,
  TechnicianRoute,
} from './components.js';

// --- Componente Despachador de Dashboard ---
// Este componente decide qué página principal mostrar según el rol del usuario.
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TECHNICIAN':
      return <MyRoutePage />;
    case 'SUPER_ADMIN':
      return <TenantsPage />;
    default:
      return <div>Bienvenido.</div>;
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
            path: 'incidents-history',
            element: <AdminRoute />,
            children: [
              {
                index: true,
                element: <IncidentsHistoryPage />,
              },
            ],
          },
          // --- RUTA CORREGIDA PARA EL DETALLE DE INCIDENCIA ---
          {
            path: 'incidents/:notificationId',
            element: <ProtectedRoute />, // <-- CAMBIO APLICADO: de AdminRoute a ProtectedRoute
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