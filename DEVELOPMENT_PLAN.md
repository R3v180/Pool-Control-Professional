# Plan de Desarrollo y Arquitectura: Pool-Control Professional

Este documento es la hoja de ruta arquitectónica y el registro de implementación para el proyecto. Sirve tanto de guía para el trabajo futuro como de crónica de las decisiones tomadas, garantizando un entendimiento profundo del sistema en cualquier punto de su ciclo de vida.

---

## ✅ FASE 0: Fundación del Entorno y Monorepo

- **Estado:** `COMPLETADA`
- **Intención Arquitectónica:** Establecer una base de desarrollo moderna, escalable y mantenible, donde el backend y el frontend, aunque desacoplados, pudieran ser gestionados desde un único repositorio para agilizar el desarrollo.
- **Entregables Clave:**
  - **Monorepo con PNPM:** Se adoptó `pnpm` con `workspaces` para una gestión de dependencias ultra-eficiente y la capacidad de ejecutar scripts de forma centralizada.
  - **Configuración Maestra de TypeScript:** Se definió un `tsconfig.json` raíz con reglas estrictas (`strict: true`) y configuración para ES Modules (`module: NodeNext`), forzando un código de alta calidad y moderno desde el inicio.

---

## ✅ FASE 1: Fundación del Backend

- **Estado:** `COMPLETADA`
- **Intención Arquitectónica:** Construir un servidor API robusto, seguro y preparado para crecer. El objetivo era tener una base sólida sobre la cual construir todos los módulos de negocio.
- **Entregables Clave:**
  - **Servidor Express.js:** Se montó un servidor con una estructura modular (`app.ts` para configuración, `server.ts` para arranque), usando ES Modules nativos.
  - **Persistencia con Prisma:** Se definió el `schema.prisma` como la "única fuente de verdad" para el modelo de datos y se estableció la conexión con PostgreSQL.
  - **Seguridad y Autenticación:** Se implementó un sistema de autenticación completo y seguro:
    - **Middleware `protect`:** Un guardián para nuestras rutas, que verifica la validez de los tokens JWT enviados a través de cookies `httpOnly`.
    - **Endpoints de Autenticación:** Se crearon las rutas `/api/auth/login`, `/logout`, `/register` y `/me`, que constituyen el portal de entrada a la aplicación.
  - **Script de `seed`:** Se creó un script para poblar la base de datos con datos esenciales (como el `SUPER_ADMIN`), permitiendo un entorno de desarrollo consistente y eliminando la necesidad de creación manual de datos críticos.

---

## ✅ FASE 2: Fundación del Frontend

- **Estado:** `COMPLETADA`
- **Intención Arquitectónica:** Crear una aplicación de cliente reactiva, rápida y con una excelente experiencia de usuario, estableciendo los patrones de diseño que se usarían en todo el frontend.
- **Entregables Clave:**
  - **Aplicación React con Vite:** Se eligió Vite por su velocidad y su excelente experiencia de desarrollo.
  - **Gestión de Estado Global (`AuthProvider`):** Se implementó un `React Context` para gestionar el estado de autenticación del usuario. Este provider es el responsable de mantener la sesión activa entre recargas de página, comunicándose con el endpoint `/api/auth/me`.
  - **Enrutamiento Protegido:** Se creó un sistema de enrutamiento con `react-router-dom`, definiendo el concepto de `ProtectedRoute` y rutas específicas por rol (`AdminRoute`, `SuperAdminRoute`), un pilar de la seguridad de la interfaz.
  - **Base de UI con Mantine:** Se estableció Mantine UI como la librería de componentes y se configuró un `theme` personalizado para una estética coherente.

---

## ✅ FASE 3: Módulo de Gestión (SuperAdmin y Admin)

- **Estado:** `COMPLETADA`
- **Intención de Negocio:** Digitalizar y automatizar por completo las tareas de configuración y planificación, empoderando al `ADMIN` para que sea 100% autónomo.
- **Entregables Clave:**
  - **CRUD de Tenants (SuperAdmin):** API y UI para que el SuperAdmin gestione el ciclo de vida de sus clientes.
  - **CRUD de Catálogos (Admin):** API y UI para que el Admin defina sus `Parámetros` y `Tareas` de servicio.
  - **CRUD de Clientes y Piscinas (Admin):** API y UI para gestionar la cartera de clientes y sus piscinas.
  - **Constructor de Fichas (Admin):** Lógica de negocio y UI para asociar ítems del catálogo a piscinas, definiendo `frecuencia` y `umbrales`.
  - **Planificador de Rutas (Admin):** Una de las funcionalidades más complejas. Se implementó una lógica de backend que genera visitas y una interfaz `Drag and Drop` para la asignación a técnicos.

---

## ✅ FASE 4: Módulo de Ejecución (Técnico)

- **Estado:** `COMPLETADA`
- **Intención de Negocio:** Optimizar al máximo el trabajo de campo del técnico, proporcionándole una herramienta clara, rápida y que elimina la necesidad de partes de trabajo en papel.
- **Entregables Clave:**
  - **"Mi Ruta de Hoy":** API y UI que presentan al técnico una lista clara de sus visitas pendientes para el día actual.
  - **"Parte de Trabajo Dinámico":** La funcionalidad estrella.
    - **Backend:** Se implementó la lógica `submitWorkOrder` dentro de una transacción de Prisma para garantizar la atomicidad de los datos. Guarda resultados, tareas completadas, notas, e incidencias.
    - **Frontend:** La `WorkOrderPage` renderiza un formulario a medida para cada visita, basándose en la configuración definida por el `ADMIN`.
  - **Reporte de Incidencias:** Se implementó el flujo completo, desde el `Checkbox` en el parte del técnico hasta la creación de un registro `Notification` en la base de datos.

---

## ✅ FASE 5: Cierre de Bucles y Experiencia de Usuario

- **Estado:** `COMPLETADA`
- **Intención de Negocio:** Conectar los flujos de información y mejorar la interfaz para proporcionar una experiencia de usuario cohesiva y completa.
- **Entregables Clave:**
  1.  **Sistema de Notificaciones (Admin):**
      - **Estado:** `COMPLETADO`
      - **Descripción:** Se ha implementado un sistema de notificaciones en tiempo real para el `ADMIN`. Incluye un componente de "campana" 🔔 en la cabecera, que alerta visualmente de nuevas incidencias. La lógica distingue entre notificaciones "leídas" y "no leídas" para una mejor gestión.
  2.  **Dashboard Principal (Admin):**
      - **Estado:** `COMPLETADO`
      - **Descripción:** La página de inicio del `ADMIN` se ha convertido en un dashboard funcional. Muestra widgets con información crítica: un resumen de las visitas programadas para el día (con su estado) y una lista de las incidencias activas que requieren atención inmediata.
  3.  **Ciclo de Vida de Gestión de Incidencias:**
      - **Estado:** `COMPLETADO`
      - **Descripción:** Se ha desarrollado el flujo completo para la resolución de incidencias. El `ADMIN` puede navegar desde una notificación directamente al parte de trabajo afectado, que se muestra en modo de **solo lectura** para garantizar la integridad de los datos. Desde allí, puede abrir un modal para añadir notas de resolución y marcar la incidencia como `RESOLVED`, cerrando así el ciclo.
  4.  **Historial de Incidencias Auditable:**
      - **Estado:** `COMPLETADO`
      - **Descripción:** Se ha creado una nueva sección en la aplicación que presenta una tabla con el historial completo de todas las incidencias (pendientes y resueltas). Esto proporciona una herramienta de auditoría y consulta fundamental.

---

## ▶️ FASE 6: Mejoras UX y Funcionalidades Avanzadas

- **Estado:** `EN CURSO`
- **Intención de Negocio:** Pulir la interfaz de usuario para una mayor claridad y comenzar a añadir capas de inteligencia de negocio y expandir las capacidades de la plataforma.
- **Plan de Acción Detallado:**
  1.  **Mejoras Visuales en el Planificador (Admin):**
      - **Propósito:** Proporcionar más información visual al `ADMIN` durante la planificación.
      - **Tareas:** Diferenciar visualmente las visitas `PENDING` de las `COMPLETED` en el planificador (ej. con colores, iconos o transparencia).
  2.  **Gestión de Consumo de Productos (Técnico y Admin):**
      - **Propósito:** Empezar a registrar los costes de material asociados a cada visita.
      - **Tareas:**
        - **Backend y Frontend:** Implementar el CRUD para el catálogo de `Product`.
        - **Frontend:** Añadir una sección en la `WorkOrderPage` para que el técnico pueda registrar los productos consumidos.
        - **Backend:** Modificar `submitWorkOrder` para guardar los registros `Consumption`.
  3.  **Modo Offline (PWA) para Técnicos:**
      - **Propósito:** Implementar la capacidad de trabajo sin conexión para el técnico.
      - **Tareas:** Investigar e implementar Service Workers e IndexedDB para permitir rellenar y guardar partes de trabajo sin conexión a internet.
  4.  **Dashboard de Gerencia (`MANAGER`):**
      - **Propósito:** Desarrollar los KPIs y gráficos de alto nivel para el rol de `MANAGER`.
      - **Tareas:** Diseño y desarrollo de los paneles de análisis de rentabilidad, costes, incidencias y rendimiento.

---

## 🔮 FASE 7 Y POSTERIORES: Ideas Futuras

- **Estado:** `PLANIFICADO`
- **Ideas Clave:**
  - **Sistema de Facturación:** Generar informes de consumo por cliente.
  - **Integración con Calendarios Externos.**
  - **App Móvil Nativa.**
