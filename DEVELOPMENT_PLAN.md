# Plan de Desarrollo y Arquitectura: Pool-Control Professional

**Filosofía del Documento:** Este no es solo un plan, es la narrativa arquitectónica y de negocio del proyecto. Sirve como la hoja de ruta para el trabajo futuro y, a la vez, como una crónica de las decisiones tomadas, garantizando un entendimiento profundo del sistema en cualquier punto de su ciclo de vida.

---

## ✅ FASE 0: Fundación Arquitectónica y del Entorno

- **Estado:** `COMPLETADA`
- **Intención Estratégica:** Establecer una base de desarrollo moderna, escalable y mantenible que permitiera un desarrollo ágil y cohesivo entre el frontend y el backend, a pesar de estar desacoplados.
- **Decisiones Arquitectónicas Clave:**
  - **Monorepo con PNPM:** Se adoptó una estructura de monorepo gestionada con `pnpm` y sus `workspaces`. Esta decisión fue estratégica para centralizar la gestión de dependencias, los scripts de `linting` y `build`, y facilitar las referencias de código entre paquetes, reduciendo la complejidad de la configuración.
  - **TypeScript Estricto como Estándar:** Se definió una política de `strict: true` en el `tsconfig.json` raíz. Esta medida proactiva se tomó para maximizar la seguridad de tipos, minimizar los errores en tiempo de ejecución y servir como auto-documentación del código, una inversión en la mantenibilidad a largo plazo.
- **Hitos de Implementación:**
  - Creación de los workspaces `@pool-control/client` y `@pool-control/server`.
  - Configuración de los scripts raíz (`dev:server`, `dev:client`, etc.) en el `package.json` principal.

---

## ✅ FASE 1: Construcción del Núcleo del Backend y la Persistencia

- **Estado:** `COMPLETADA`
- **Intención Estratégica:** Construir un servidor API robusto, seguro y con una fuente de verdad única y fiable para el modelo de datos, sentando las bases para todas las futuras funcionalidades de negocio.
- **Decisiones Arquitectónicas Clave:**
  - **Prisma como ORM y "Schema-as-Truth":** Se eligió Prisma por su seguridad de tipos de extremo a extremo. El `schema.prisma` se estableció como la única fuente de verdad, definiendo los modelos de la base de datos (conectada a PostgreSQL) y generando automáticamente un cliente de TypeScript tipado, lo que elimina una clase entera de errores de inconsistencia de datos.
  - **Autenticación Segura con JWT en Cookies `httpOnly`:** En lugar de enviar tokens en cabeceras o en el cuerpo de la respuesta, se optó por almacenarlos en cookies `httpOnly`. Esta es una decisión de seguridad crítica para mitigar los ataques XSS (Cross-Site Scripting), ya que el token no es accesible desde el JavaScript del navegador.
- **Hitos de Implementación:**
  - Montaje de un servidor **Express.js** con una estructura modular.
  - Implementación del middleware `protect` para la validación de tokens JWT en rutas privadas.
  - Creación de los endpoints `/api/auth/login`, `/logout`, y `/me` para gestionar el ciclo de vida de la sesión del usuario.

---

## ✅ FASE 2: Fundación del Frontend y Experiencia de Usuario Base

- **Estado:** `COMPLETADA`
- **Intención Estratégica:** Crear una aplicación de cliente reactiva, rápida y segura, estableciendo los patrones de diseño para la gestión de estado y la protección de rutas que se usarían en todo el frontend.
- **Decisiones Arquitectónicas Clave:**
  - **React con Vite:** Se seleccionó Vite por su HMR (Hot Module Replacement) instantáneo y su experiencia de desarrollo superior, lo que acelera significativamente el ciclo de desarrollo del frontend.
  - **Gestión de Estado Centralizada con `React Context`:** Para el estado de autenticación global, se implementó un `AuthProvider`. Esta decisión evita la necesidad de librerías de estado más complejas (como Redux) para un caso de uso que `Context` maneja perfectamente, manteniendo la arquitectura ligera.
- **Hitos de Implementación:**
  - Creación del sistema de enrutamiento con `react-router-dom`, incluyendo componentes de protección de rutas por rol (`AdminRoute`, `TechnicianRoute`).
  - Configuración de **Mantine UI** con un tema personalizado (`theme.ts`) para una construcción rápida y coherente de la interfaz.

---

## ✅ FASE 3 y 4: Módulos de Gestión (Admin) y Ejecución (Técnico)

- **Estado:** `COMPLETADAS`
- **Intención Estratégica:** Digitalizar el flujo operativo principal completo, desde la configuración inicial de los servicios hasta la ejecución en campo por parte del técnico.
- **Hitos de Implementación:**
  - **CRUDS Completos:** Desarrollo de las APIs y las UIs para la gestión de `Tenants`, `Clients`, `Pools`, y los catálogos de `Parameters` y `Tasks`.
  - **Constructor de Fichas:** Lógica para que el `ADMIN` asocie ítems del catálogo a cada piscina, definiendo el "contrato de servicio".
  - **Planificador `Drag and Drop`:** Implementación de la `PlannerPage` con `dnd-kit` para la asignación de visitas.
  - **Parte de Trabajo Dinámico:** Creación de la `WorkOrderPage` que se renderiza dinámicamente y el endpoint `submitWorkOrder` que guarda los resultados en una transacción atómica.
  - **Flujo de Reporte de Incidencias:** Implementada la lógica para que el `hasIncident` marcado por el técnico cree un registro `Notification` en la base de datos.

---

## ✅ FASE 5: Inteligencia de Gestión y Pulido de la Experiencia de Usuario

- **Estado:** `COMPLETADA`
- **Intención Estratégica:** Cerrar los bucles de comunicación y transformar la información recopilada en conocimiento accionable para el administrador, mejorando drásticamente la usabilidad de las herramientas de supervisión.
- **Hitos de Implementación:**
  - **Ciclo de Vida de Incidencias:** El modelo `Notification` se enriqueció con `status` y `priority`. Se implementaron los flujos de "Clasificar" y "Resolver" incidencias, permitiendo al `ADMIN` gestionar activamente los problemas.
  - **Dashboard Operativo:** Se reemplazó la página de inicio del `ADMIN` por un dashboard que muestra widgets con las visitas del día y las incidencias activas, usando las notas reales del técnico para un contexto inmediato.
  - **Historial de Incidencias Auditable:** Se creó la página de "Gestión de Incidencias" con una API robusta que soporta **filtrado y paginación en el lado del servidor**, garantizando su rendimiento y escalabilidad.
  - **Consistencia Visual en Planificador y Dashboard:** Se ha unificado el lenguaje visual. Las visitas completadas se atenúan y se codifican por color (verde/rojo) según su resultado, proporcionando una claridad instantánea.

---

## ▶️ FASE 6: Control de Rentabilidad y Funcionalidades Avanzadas

- **Estado:** `EN CURSO`
- **Intención Estratégica:** Añadir la dimensión económica a la plataforma, permitiendo el control de costes y sentando las bases para la facturación. Además, empezar a desarrollar funcionalidades de alto valor añadido.
- **Plan de Acción Detallado:**
  1.  **Gestión de Consumo de Productos:**
      - **Propósito de Negocio:** Registrar los costes de material asociados a cada visita para un control preciso de la rentabilidad y una gestión de inventario futura. Es el pilar de la gestión financiera.
      - **Tareas Técnicas:** Implementar los modelos `Product` y `Consumption` en el schema, crear la API CRUD para el catálogo de productos y añadir la sección de registro de consumo en la `WorkOrderPage`.
  2.  **Mejoras en el Historial de Incidencias:**
      - **Propósito de Negocio:** Aumentar la eficiencia del `ADMIN` al revisar el historial.
      - **Tareas Técnicas:** Implementar filas expandibles en la tabla de `IncidentsHistoryPage` para mostrar las notas de técnico y resolución sin cambiar de pantalla.
  3.  **Modo Offline (PWA) para Técnicos:**
      - **Propósito de Negocio:** Garantizar la operatividad del técnico en zonas de baja o nula conectividad, un problema común en el trabajo de campo.
      - **Tareas Técnicas:** Investigar e implementar `Service Workers` e `IndexedDB`.
  4.  **Dashboard de Gerencia (`MANAGER`):**
      - **Propósito de Negocio:** Proporcionar al rol `MANAGER` KPIs y gráficos de alto nivel para el análisis estratégico del negocio.
      - **Tareas Técnicas:** Crear endpoints de agregación en el backend y desarrollar componentes de visualización de datos en el frontend.
