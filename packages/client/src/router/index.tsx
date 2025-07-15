// ====== [32] packages/client/src/router/index.tsx ======
// filename: packages/client/src/router/index.tsx
// Version: 2.6.1 (FIX: Use correct route guard for incidents history)
// description: Changed the route guard for '/incidents-history' from AdminRoute to FinancialAdminRoute to allow access for Managers.

import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage.js';
import { TenantsPage } from '../features/superadmin/pages/TenantsPage.js';
import { ParameterCatalogPage } from '../features/admin/pages/ParameterCatalogPage.js';
import { TaskCatalogPage } from '../features/admin/pages/TaskCatalogPage.js';
import { ProductCatalogPage } from '../features/admin/pages/ProductCatalogPage.js';
import { ProductCategoryCatalogPage } from '../features/admin/pages/ProductCategoryCatalogPage.js';
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
import { InvoicingReportPage } from '../features/manager/pages/InvoicingReportPage.js';
import { ConsumptionReportPage } from '../features/admin/pages/reports/ConsumptionReportPage.js';
import { PaymentsPage } from '../features/financials/pages/PaymentsPage.js';
import { ExpensesPage } from '../features/financials/pages/ExpensesPage.js';
import { useAuth } from '../providers/AuthProvider.js';
import {
  AppLayout,
  ProtectedRoute,
  SuperAdminRoute,
  AdminRoute,
  TechnicianRoute,
  FinancialAdminRoute,
} from './components.js';

// Este componente decide qué dashboard mostrar basado en el rol activo (respetando el "rol camaleón")
const RoleBasedDashboard = () => {
  const { activeRole, user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') return <TenantsPage />;
  
  // Se usa activeRole para que el cambio de vista del Manager funcione
  switch (activeRole) {
    case 'ADMIN': return <AdminDashboard />;
    case 'TECHNICIAN': return <MyRoutePage />;
    case 'MANAGER': return <ManagerDashboard />;
    default: return <div>Cargando...</div>;
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
          { index: true, element: <RoleBasedDashboard /> },
          {
            path: 'reports',
            element: <FinancialAdminRoute />, 
            children: [
                { path: 'consumption', element: <ConsumptionReportPage /> },
                { path: 'invoicing', element: <InvoicingReportPage /> }
            ]
          },
          {
            path: 'financials',
            element: <AdminRoute />,
            children: [
                { path: 'payments', element: <PaymentsPage /> },
                { path: 'expenses', element: <ExpensesPage /> }
            ]
          },
          {
            path: 'superadmin',
            element: <SuperAdminRoute />,
            children: [ { path: 'tenants', element: <TenantsPage /> } ],
          },
          {
            path: 'planner',
            element: <AdminRoute />,
            children: [ { index: true, element: <PlannerPage /> } ],
          },
          {
            path: 'clients',
            element: <AdminRoute />,
            children: [
              { index: true, element: <ClientsPage /> },
              { path: ':id', element: <ClientDetailPage /> },
            ],
          },
          {
            path: 'pools/:id', 
            element: <AdminRoute />,
            children: [ { index: true, element: <PoolDetailPage /> } ]
          },
          {
            path: 'incidents-history',
            // ✅ CORRECCIÓN: Usar la guarda que permite acceso a Manager y Admin.
            element: <FinancialAdminRoute />,
            children: [ { index: true, element: <IncidentsHistoryPage /> } ],
          },
          {
            path: 'incidents/:notificationId',
            element: <ProtectedRoute />, // Accesible por Admin y Técnico
            children: [ { index: true, element: <IncidentDetailPage /> } ]
          },
          {
            path: 'catalog',
            element: <AdminRoute />,
            children: [
              { path: 'parameters', element: <ParameterCatalogPage /> },
              { path: 'tasks', element: <TaskCatalogPage /> },
              { path: 'products', element: <ProductCatalogPage /> },
              { path: 'product-categories', element: <ProductCategoryCatalogPage /> }
            ],
          },
          {
            path: 'my-route',
            element: <TechnicianRoute />,
            children: [ { index: true, element: <MyRoutePage /> } ],
          },
          {
            path: 'visits/:visitId',
            element: <ProtectedRoute />, // Accesible por Admin y Técnico
            children: [ { index: true, element: <WorkOrderPage /> } ],
          },
        ],
      },
    ],
  },
]);