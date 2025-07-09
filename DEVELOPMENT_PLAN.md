# Plan de Desarrollo y Arquitectura: Pool-Control Professional

Este documento es la hoja de ruta arquitectónica y el registro de implementación para el proyecto. Sirve tanto de guía para el trabajo futuro como de crónica de las decisiones tomadas, garantizando un entendimiento profundo del sistema en cualquier punto de su ciclo de vida.

---

## ✅ FASE 0: Fundación del Entorno y Monorepo

- **Estado:** `COMPLETADA`
- **Objetivo:** Establecer una base de desarrollo robusta, consistente y escalable.
- **Entregables Clave:**
  - **Monorepo con PNPM:** Configuración de `pnpm-workspace.yaml` para gestionar los paquetes `server` y `client` de forma centralizada.
  - **Configuración Maestra de TypeScript:** `tsconfig.json` raíz con reglas estrictas y modernas (`strict: true`, `module: NodeNext`) que se heredan en todo el proyecto.
  * **Gestión de Código Fuente:** `/.gitignore` configurado para excluir dependencias, variables de entorno y artefactos de compilación.

---

## ✅ FASE 1: Fundación del Backend

- **Estado:** `COMPLETADA`
- **Objetivo:** Construir un servidor API funcional, seguro y resiliente.
- **Entregables Clave:**
  - **Servidor Express.js:** `app.ts` y `server.ts` configurados para usar ES Modules, con middlewares esenciales (CORS, JSON, Cookie Parser).
  - **Conexión a Base de Datos:** `schema.prisma` define el modelo de datos completo. Se ha realizado la migración inicial y la conexión con PostgreSQL es estable.
  - **Script de Seeding:** `prisma/seed.ts` implementado para crear el `SUPER_ADMIN` y el tenant de sistema, garantizando un punto de partida consistente para el desarrollo y las pruebas.
  - **Seguridad y Autenticación:**
    - `auth.middleware.ts` y `jwt.utils.ts`: Sistema robusto de protección de rutas basado en tokens JWT en cookies `httpOnly`.
    - `password.utils.ts`: Lógica de hashing y comparación de contraseñas aislada y segura.
    - `auth.routes.ts`: Endpoints `login`, `logout`, `register` y `me` implementados y funcionales.
  - **Gestión de Errores:** `error.middleware.ts` implementado como un "catch-all" para manejar excepciones de forma controlada y devolver respuestas de error estandarizadas.

---

## ✅ FASE 2: Fundación del Frontend

- **Estado:** `COMPLETADA`
- **Objetivo:** Construir una aplicación React cliente, conectada al backend y con una gestión de estado de autenticación sólida.
- **Entregables Clave:**
  - **Aplicación React con Vite:** `vite.config.ts` configurado, incluyendo un proxy para las llamadas a la API que simplifica el desarrollo.
  - **Gestión de Estado de Autenticación:** `AuthProvider.tsx` implementado usando React Context. Gestiona el estado del usuario y la sesión, persistiendo a través de recargas de página mediante el endpoint `/api/auth/me`.
  - **Sistema de Enrutamiento:** `router/index.tsx` y `router/components.tsx` definen la estructura de navegación de la aplicación, implementando componentes de protección de rutas por rol (`ProtectedRoute`, `SuperAdminRoute`, `AdminRoute`).
  - **UI y Estilo:** `theme.ts` define el tema base de Mantine UI, asegurando una estética consistente. La `AppLayout` provee la estructura visual principal (header, navbar).

---

## ✅ FASE 3: Módulos de Gestión (Admin y SuperAdmin)

- **Estado:** `COMPLETADA`
- **Objetivo:** Implementar las funcionalidades de configuración y gestión que son el núcleo del panel de administración.
- **Entregables Clave:**
  - **Módulo `SUPER_ADMIN` - Gestión de Tenants:**
    - **Backend:** API CRUD completa en `/api/tenants`.
    - **Frontend:** `TenantsPage.tsx` permite listar, crear, actualizar estado y eliminar tenants.
  - **Módulo `ADMIN` - Gestión de Catálogos:**
    - **Backend:** APIs CRUD para `/api/parameters` y `/api/tasks`.
    - **Frontend:** `ParameterCatalogPage.tsx` y `TaskCatalogPage.tsx` permiten la gestión completa de las plantillas de parámetros y tareas.
  - **Módulo `ADMIN` - Gestión de Clientes y Piscinas:**
    - **Backend:** APIs CRUD para `/api/clients` y `/api/pools`.
    - **Frontend:** `ClientsPage.tsx` y `ClientDetailPage.tsx` permiten la gestión de clientes y sus piscinas asociadas.
  - **Módulo `ADMIN` - Constructor de Fichas de Mantenimiento:**
    - **Backend:** API CRUD para `/api/pool-configurations`.
    - **Frontend:** `PoolDetailPage.tsx` funciona como el constructor, permitiendo asociar ítems de los catálogos a una piscina.
  - **Módulo `ADMIN` - Planificador de Rutas:**
    - **Backend:** API en `/api/visits` para generar y asignar visitas.
    - **Frontend:** `PlannerPage.tsx` implementa un planificador visual con `Drag and Drop`.
  - **Módulo `TECHNICIAN` - "Mi Ruta de Hoy":**
    - **Backend:** Endpoint `GET /api/visits/my-route` que filtra y devuelve las visitas del día para el técnico logueado.
    - **Frontend:** `MyRoutePage.tsx` muestra las visitas del día de forma clara.

---

## ▶️ FASE 4: Módulo de Ejecución (Técnico) - Parte de Trabajo

- **Estado:** `EN CURSO`
- **Objetivo:** Desarrollar la funcionalidad más crítica de la aplicación: el formulario donde el técnico registra los datos de su visita.
- **Plan de Acción Detallado:**
  1.  **Backend - Obtener Detalles de la Visita:**
      - **Archivo:** `packages/server/src/api/visits/visits.service.ts`
      - **Tarea:** Crear una nueva función `getVisitDetails(visitId)` que devuelva no solo la visita, sino también la `PoolConfiguration` asociada (con sus `ParameterTemplate` y `TaskTemplate` anidados). Esto es vital para que el frontend sepa qué formulario construir.
      - **Archivo:** `packages/server/src/api/visits/visits.controller.ts` y `visits.routes.ts`
      - **Tarea:** Exponer la nueva función de servicio a través de un nuevo endpoint `GET /api/visits/:id`.
  2.  **Backend - Procesar el Parte de Trabajo:**
      - **Schema:** Modificar `schema.prisma` para añadir `hasIncident: Boolean @default(false)` al modelo `Visit` y crear el nuevo modelo `Notification`. Ejecutar la migración.
      - **Archivo:** `packages/server/src/api/visits/visits.service.ts`
      - **Tarea:** Crear una función `submitWorkOrder(visitId, data)` que procese los datos del formulario, cree los `VisitResult`, actualice el estado de la visita, y cree una `Notification` si procede.
      - **Archivo:** `packages/server/src/api/visits/visits.controller.ts` y `visits.routes.ts`
      - **Tarea:** Exponer esta lógica a través de un endpoint `POST /api/visits/:id/complete`.
  3.  **Frontend - Construir la Página del Parte de Trabajo:**
      - **Archivo:** Crear `packages/client/src/features/technician/pages/WorkOrderPage.tsx`.
      - **Tarea:** Esta página recibirá un `visitId` de la URL. Hará una llamada al nuevo endpoint `GET /api/visits/:id` para obtener los detalles.
  4.  **Frontend - Renderizado Dinámico del Formulario:**
      - **Archivo:** `WorkOrderPage.tsx`.
      - **Tarea:** Basándose en los datos recibidos, la página renderizará dinámicamente los controles de formulario necesarios: `NumberInput` para parámetros numéricos, `Switch` para booleanos, `Checkbox` para tareas, etc. Se incluirá el `Checkbox` para "Reportar Incidencia".
  5.  **Frontend - Envío de Datos:**
      - **Archivo:** `WorkOrderPage.tsx`.
      - **Tarea:** Implementar la lógica de envío del formulario, que llamará al endpoint `POST /api/visits/:id/complete` con todos los datos recopilados.

---

## 🔮 FASE 5 Y POSTERIORES: Funcionalidades Futuras

- **Estado:** `PLANIFICADO`
- **Objetivo:** Mejorar la aplicación con funcionalidades de alto valor.
- **Ideas Clave:**
  - **Modo Offline (PWA):** Implementar Service Workers e IndexedDB.
  - **Dashboard de Gerencia:** Desarrollar los KPIs y gráficos para el rol de `MANAGER`.
  - **Gestión de Productos y Consumos:** Implementar la API y la UI para gestionar el catálogo de productos y registrar su consumo en cada visita.
  - **Facturación:** Generar informes de consumo por cliente para facilitar la facturación.
  - **Notificaciones en Tiempo Real:** Implementar un sistema de notificaciones push o WebSockets para el `ADMIN`.
