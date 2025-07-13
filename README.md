# Pool-Control Professional: Especificación Funcional y Arquitectónica v8.0

| **Documentos de Apoyo:** | [Ver Plan de Desarrollo Estratégico](./DEVELOPMENT_PLAN.md) | [Ver Estado Actual del Proyecto](./PROJECT_STATUS.md) |
| :----------------------- | :---------------------------------------------------------- | :---------------------------------------------------- |

---

**Fecha de la Versión:** 13 de julio de 2025
**Proyecto:** Plataforma SaaS de Gestión Integral para Empresas de Mantenimiento de Piscinas.

---

## 1. 🎯 Visión del Producto: El Sistema Nervioso de su Negocio

**Pool-Control Professional** no es una simple aplicación de gestión; es una plataforma SaaS (Software como Servicio) concebida para ser el **centro de operaciones digital e inteligente** que impulsa a las empresas de mantenimiento de piscinas hacia el futuro.

Nuestra misión es erradicar las ineficiencias que lastran al sector: la dependencia del papel, la comunicación fragmentada que causa errores costosos, la falta de control sobre los costes de materiales y, sobre todo, la incapacidad de tomar decisiones estratégicas basadas en datos fiables. A través de la digitalización y la automatización, transformamos la gestión reactiva en una **operativa proactiva, estandarizada, medible y, fundamentalmente, más rentable.**

---

## 2. 👥 Definición de Roles: Un Ecosistema Conectado

La plataforma se fundamenta en un sistema de roles estricto y flexible, diseñado para que cada miembro del equipo tenga exactamente las herramientas que necesita, ni más, ni menos.

| Rol                  | Misión Principal                        | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**       | Responsable del ciclo de vida de los tenants (las empresas clientes). Realiza el CRUD completo sobre los **Tenants** y crea el usuario `ADMIN` inicial para cada nueva empresa. Por diseño, no tiene visibilidad alguna sobre los datos operativos de sus clientes, garantizando la máxima privacidad.                                                                                                                                                                                                                                                                                                                                                 |
| **Admin (Isa)**      | **Orquestar la Operativa Diaria.**      | Es la "Arquitecta del Servicio". Su misión es configurar, planificar, supervisar y analizar. Define los catálogos de **servicios** y **productos**, gestiona **clientes** y **piscinas**, diseña las **fichas de mantenimiento**, planifica las **rutas semanales** con una interfaz `Drag & Drop`, gestiona proactivamente las **incidencias** a través de un sistema de ticketing avanzado y analiza la rentabilidad con **informes de consumo**.                                                                                                                                                                                                    |
| **Técnico**          | **Ejecutar con Precisión en Campo.**    | Su interfaz está 100% optimizada para la eficiencia en movilidad. Su flujo es simple y directo: consultar su **ruta de trabajo**, rellenar el **parte de trabajo dinámico** (mediciones, tareas, consumo de productos) y **reportar incidencias** con notas y fotografías. Es notificado de cualquier actualización sobre sus tareas, manteniendo una comunicación fluida con la oficina.                                                                                                                                                                                                                                                              |
| **Gerencia (Jorge)** | **Analizar y Actuar sobre el Negocio.** | 👑 **El Rol "Camaleón"**. Este es el rol más potente y flexible. Por defecto, opera en un **Modo Supervisor** de solo lectura, enfocado en el análisis estratégico a través de un dashboard con KPIs de alto nivel. Sin embargo, su característica clave es el **"Selector de Vista"**: en caso de necesidad, el gerente puede asumir temporalmente la **Vista de Administración** o la **Vista de Técnico**, heredando todas sus funcionalidades para cubrir una ausencia o intervenir en la operativa. Cada acción realizada, sin importar la vista, queda registrada con su propio usuario, garantizando una auditoría y responsabilidad completas. |

---

## 3. ⚙️ Especificación Funcional: El Ciclo Virtuoso de Operaciones

El sistema opera como un ciclo continuo y perfectamente enlazado: **CONFIGURAR ➔ PLANIFICAR ➔ EJECUTAR ➔ SUPERVISAR ➔ ANALIZAR**.

### [cite_start]**ETAPA 1: CONFIGURACIÓN (El Cerebro del Sistema)** [cite: 101]

_Rol: Admin_

Aquí se define el ADN del servicio que ofrece la empresa. Es la base para la estandarización y la automatización.

- **Pantallas de Catálogos (`ParameterCatalogPage`, `TaskCatalogPage`, `ProductCatalogPage`):**

  - [cite_start]**Parámetros:** Se define cada medición posible (ej. "Nivel de pH") [cite: 102][cite_start], especificando su unidad y tipo de dato (`NUMBER`, `BOOLEAN`, `SELECT`, etc.)[cite: 102]. Esto permite crear formularios dinámicos y a prueba de errores.
  - [cite_start]**Tareas:** Se crea una librería de todas las acciones físicas (ej. "Limpieza de cestos de skimmers")[cite: 103].
  - [cite_start]**Productos:** Se gestiona el inventario de productos químicos y materiales, especificando no solo el nombre y la unidad, sino un campo crucial: el **`Coste`** por unidad[cite: 104], que alimentará los informes de rentabilidad.

- **Pantalla: Constructor de Fichas de Mantenimiento (`PoolDetailPage`):**
  - Esta es una de las funciones más potentes. [cite_start]Para **cada piscina individual**, el `ADMIN` arrastra y asocia ítems de los catálogos para definir el "contrato de servicio" digital[cite: 105, 106].
  - [cite_start]Aquí se establecen las reglas de negocio, como la `Frecuencia` de cada tarea y los **`Umbrales de Alerta`** (mínimo y máximo) para los parámetros, que en el futuro activarán notificaciones proactivas[cite: 106].

### **ETAPA 2: PLANIFICACIÓN Y EJECUCIÓN (El Corazón Operativo)**

_Roles: Admin, Técnico_

- **Pantalla: Planificador Semanal (`PlannerPage`):**

  - [cite_start]Una interfaz visual `Drag & Drop` donde el `ADMIN` asigna las visitas pendientes a los técnicos[cite: 108].
  - [cite_start]La interfaz ofrece **feedback visual instantáneo**: las visitas completadas se marcan en verde (si todo está OK) o en rojo (si tienen una incidencia), permitiendo un seguimiento rápido y eficaz del progreso semanal[cite: 109].

- **Pantalla: Parte de Trabajo Dinámico (`WorkOrderPage`):**
  - La herramienta de campo del técnico, diseñada para ser rápida e infalible. [cite_start]La página genera un **formulario dinámico y único** basado en la ficha de mantenimiento de la piscina que está visitando[cite: 112].
  - [cite_start]El técnico registra valores, marca tareas, y añade los productos consumidos desde el catálogo[cite: 113].
  - [cite_start]Puede reportar una **incidencia** con observaciones detalladas y **adjuntar múltiples fotografías**[cite: 114, 19], que se suben de forma segura a la nube. [cite_start]Todos los datos se guardan en una única transacción atómica[cite: 115].

### **ETAPA 3: SUPERVISIÓN Y GESTIÓN DE INCIDENCIAS (Control de Calidad Proactivo)**

_Roles: Admin, Técnico_

- **Pantalla: Dashboard del Administrador (`AdminDashboard`):**

  - La "torre de control" del `ADMIN`. [cite_start]Ofrece widgets en tiempo real con el estado de las visitas del día y una lista priorizada de **incidencias activas**[cite: 118, 119]. [cite_start]Las incidencias que superan un umbral de tiempo se resaltan automáticamente, exigiendo atención inmediata[cite: 120].

- **Flujo de Ticketing Avanzado (`IncidentDetailPage`):**
  - Este ya no es un simple sistema de alertas, es un **centro de mando para la resolución de problemas**.
  - [cite_start]Cuando una incidencia llega, el `ADMIN` puede crear **Tareas de Seguimiento (`IncidentTask`)** asignables, con prioridad y fecha de plazo[cite: 8].
  - [cite_start]Se establece un **hilo de comunicación bidireccional**: el técnico es notificado de su nueva tarea y puede actualizar su estado (`EN PROGRESO`, `COMPLETADA`), añadir comentarios o solicitar aplazamientos, notificando a su vez al `ADMIN` de cada avance[cite: 16, 37].
  - [cite_start]Cada acción queda registrada en un **historial de auditoría inmutable**, proporcionando una trazabilidad total[cite: 12].

### **ETAPA 4: ANÁLISIS DE NEGOCIO (Inteligencia Financiera)**

_Roles: Admin, Gerencia_

- **Pantalla: Informe de Consumos y Costes (`ConsumptionReportPage`):**
  - **Análisis de Rentabilidad:** Esta herramienta permite responder a la pregunta: "¿Estamos ganando dinero con este cliente?". [cite_start]Utiliza los costes de los productos y los consumos registrados para generar informes de rentabilidad por cliente y periodo[cite: 25, 26].
  - **Desglose Interactivo (Drill-Down):** Es la funcionalidad estrella. El usuario puede:
    1.  Ver el coste total de un cliente.
    2.  **Hacer clic** para expandir y ver el desglose de productos que componen ese coste.
    3.  **Hacer clic** de nuevo en un producto para ver una lista de las visitas exactas donde se utilizó.
    4.  **Navegar** desde esa lista directamente al parte de trabajo original para una auditoría completa.
  - [cite_start]**Exportación para Facturación:** Todos los informes se pueden exportar a **CSV**, listos para ser utilizados en cualquier programa de contabilidad o para generar facturas[cite: 126].

---

## 4. 🗺️ Próximas Funcionalidades Planificadas (Roadmap Futuro)

- [cite_start]**Dashboard de Gerencia Avanzado:** Implementar la vista principal para el rol `MANAGER`, incluyendo los KPIs y gráficos de negocio, así como el "Selector de Vista" para actuar como otros roles[cite: 29]. **(Próxima gran funcionalidad)**.
- **Motor Financiero v2 (Facturación y Precios):** Evolucionar el módulo de informes para manejar `Precios de Venta`, `IVA`, diferentes `Modelos de Facturación` por cliente (ej. "Todo Incluido") y `Reglas de Descuento` por producto o familia de productos.
- **Alertas Proactivas por Umbrales:** Desarrollar la lógica para notificar automáticamente a los administradores cuando los parámetros medidos se salgan de los rangos de seguridad establecidos.
- [cite_start]**Modo Offline (PWA):** Permitir a los técnicos trabajar sin conexión a internet[cite: 27].
- **Sistema de Facturación y Gestión de Inventario:** El paso final, que permitiría generar facturas directamente desde la plataforma y llevar un control de stock en tiempo real.
