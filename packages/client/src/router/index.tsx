// filename: packages/client/src/router/index.tsx
// Version: 2.9.4 (FEAT: Add route for AccountStatusPage)
// description: Se importa y se añade la ruta para la nueva página de Estado de Cuentas.

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
import { ZoneManagementPage } from '../features/admin/pages/zones/ZoneManagementPage.js';
import { RouteTemplatesPage } from '../features/admin/pages/planning/RouteTemplatesPage.js';
import { RouteTemplateFormPage } from '../features/admin/pages/planning/RouteTemplateFormPage.js';
import { AvailabilityPage } from '../features/admin/pages/planning/AvailabilityPage.js';
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
// ✅ 1. Importar el nuevo componente de página
import { AccountStatusPage } from '../features/financials/pages/AccountStatusPage.js';
import { useAuth } from '../providers/AuthProvider.js';
import {
  AppLayout,
  ProtectedRoute,
  SuperAdminRoute,
  AdminRoute,
  TechnicianRoute,
  FinancialAdminRoute,
} from './components.js';

const RoleBasedDashboard = () => {
  const { activeRole, user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') return <TenantsPage />;
  
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
            path: 'planning',
            element: <AdminRoute />,
            children: [
              { path: 'zones', element: <ZoneManagementPage /> },
              { 
                path: 'routes', 
                children: [
                  { index: true, element: <RouteTemplatesPage /> },
                  { path: 'new', element: <RouteTemplateFormPage /> },
                  { path: ':id', element: <RouteTemplateFormPage /> },
                ]
              },
              { path: 'availability', element: <AvailabilityPage /> },
            ]
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
            element: <FinancialAdminRoute />,
            children: [ { index: true, element: <IncidentsHistoryPage /> } ],
          },
          {
            path: 'incidents/:notificationId',
            element: <ProtectedRoute />,
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
            path: 'reports',
            element: <FinancialAdminRoute />, 
            children: [
                { path: 'consumption', element: <ConsumptionReportPage /> },
                { path: 'invoicing', element: <InvoicingReportPage /> }
            ]
          },
           {
            path: 'financials',
            // ✅ Se cambia a FinancialAdminRoute para que el Manager también pueda acceder
            element: <FinancialAdminRoute />,
            children: [
                { path: 'payments', element: <PaymentsPage /> },
                { path: 'expenses', element: <ExpensesPage /> },
                // ✅ 2. Añadir la nueva ruta
                { path: 'account-status', element: <AccountStatusPage /> },
             ]
          },
          {
            path: 'superadmin',
            element: <SuperAdminRoute />,
            children: [ { path: 'tenants', element: <TenantsPage /> } ],
          },
          {
            path: 'my-route',
            element: <TechnicianRoute />,
            children: [ { index: true, element: <MyRoutePage /> } ],
          },
          {
            path: 'visits/:visitId',
            element: <ProtectedRoute />,
            children: [ { index: true, element: <WorkOrderPage /> } ],
           },
        ],
      },
    ],
  },
]);