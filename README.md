# Pool-Control Professional: Especificación Funcional y Arquitectónica v9.0

| **Documentos de Apoyo:** | [Ver Plan de Desarrollo Estratégico](./DEVELOPMENT_PLAN.md) | [Ver Estado Actual del Proyecto](./PROJECT_STATUS.md) |
| :----------------------- | :---------------------------------------------------------- | :---------------------------------------------------- |

---

**Fecha de la Versión:** 13 de julio de 2025
**Proyecto:** Plataforma SaaS de Gestión Integral para Empresas de Mantenimiento de Piscinas.

---

## 1. 🎯 Visión del Producto: El Sistema Nervioso Inteligente de su Negocio

**Pool-Control Professional** no es una simple aplicación de gestión; es una plataforma SaaS (Software como Servicio) concebida para ser el **centro de operaciones digital e inteligente** que impulsa a las empresas de mantenimiento de piscinas hacia una nueva era de eficiencia y rentabilidad.

Nuestra misión es erradicar las ineficiencias que lastran al sector: la dependencia del papel, la comunicación fragmentada que causa errores costosos, la falta de control sobre los costes de materiales y, sobre todo, la incapacidad de tomar decisiones estratégicas. A través de la digitalización y la automatización, transformamos la gestión reactiva en una **operativa proactiva, estandarizada, medible y, fundamentalmente, más rentable,** proporcionando una **inteligencia de negocio** sin precedentes.

---

## 2. 👥 Definición de Roles: Un Ecosistema Conectado y Flexible

La plataforma se fundamenta en un sistema de roles diseñado para que cada miembro del equipo tenga exactamente las herramientas que necesita, maximizando la eficiencia y la seguridad.

| Rol                  | Misión Principal                        | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**       | Responsable del ciclo de vida de los tenants (las empresas clientes). [cite_start]Realiza el CRUD completo sobre los **Tenants** [cite: 86] [cite_start]y crea el usuario `ADMIN` inicial para cada nueva empresa[cite: 86]. Por diseño, no tiene visibilidad alguna sobre los datos operativos de sus clientes, garantizando la máxima privacidad.                                                                                                                                                                                                                                                                                                                                                         |
| **Admin (Isa)**      | **Orquestar la Operativa Diaria.**      | Es la "Arquitecta del Servicio". Su misión es configurar, planificar, supervisar y analizar. [cite_start]Define los catálogos de **servicios** y **productos** [cite: 101][cite_start], gestiona **clientes** y **piscinas** [cite: 90][cite_start], diseña las **fichas de mantenimiento** [cite: 90][cite_start], planifica las **rutas semanales** con una interfaz `Drag & Drop`[cite: 90], gestiona proactivamente las **incidencias** a través de un sistema de ticketing avanzado y analiza la **rentabilidad** con informes de consumo detallados.                                                                                                                                                  |
| **Técnico**          | **Ejecutar con Precisión en Campo.**    | [cite_start]Su interfaz está 100% optimizada para la eficiencia en movilidad[cite: 93]. [cite_start]Su flujo es simple y directo: consultar su **ruta de trabajo del día** (visitas y tareas especiales) [cite: 94, 20][cite_start], rellenar el **parte de trabajo dinámico** (mediciones, tareas, consumo de productos) [cite: 113, 95] [cite_start]y reportar cualquier **incidencia** con notas y fotografías[cite: 19, 95]. [cite_start]Es notificado de cualquier actualización sobre sus tareas[cite: 58], manteniendo una comunicación fluida con la oficina.                                                                                                                                       |
| **Gerencia (Jorge)** | **Analizar y Actuar sobre el Negocio.** | 👑 **El Rol "Camaleón"**. Este es el rol más potente y flexible, diseñado para el propietario o gerente del negocio. [cite_start]Por defecto, opera en un **Modo Supervisor** de solo lectura, enfocado en el análisis estratégico a través de un dashboard con KPIs de alto nivel[cite: 98]. Sin embargo, su característica clave es el **"Selector de Vista"**: en caso de necesidad (ej. cubrir una baja), el gerente puede asumir temporalmente la **Vista de Administración** o la **Vista de Técnico**, heredando todas sus funcionalidades. Cada acción que realiza, sin importar la vista, queda registrada con su propio usuario, garantizando una auditoría completa y una responsabilidad total. |

---

## 3. ⚙️ Especificación Funcional: El Ciclo Virtuoso de Operaciones

El sistema opera como un ciclo continuo y perfectamente enlazado: **CONFIGURAR ➔ PLANIFICAR ➔ EJECUTAR ➔ SUPERVISAR ➔ ANALIZAR**.

### **ETAPA 1: CONFIGURACIÓN (El Cerebro del Sistema)**

_Rol: Admin_

- [cite_start]**Pantallas de Catálogos:** Se define cada **Parámetro** de medición (ej. "Nivel de pH") con su tipo de dato y unidad [cite: 102][cite_start], cada **Tarea** física [cite: 103][cite_start], y cada **Producto** con su unidad y **Coste** interno[cite: 104], que es la base para los cálculos de rentabilidad.
- [cite_start]**Constructor de Fichas de Mantenimiento (`PoolDetailPage`):** Para cada piscina, el `ADMIN` define un "contrato de servicio" digital, asociando parámetros y tareas de los catálogos[cite: 106]. [cite_start]Aquí se establecen los **umbrales de alerta** (mín/máx) para los parámetros, que activarán las alertas proactivas[cite: 106].

### **ETAPA 2: PLANIFICACIÓN Y EJECUCIÓN (El Corazón Operativo)**

_Roles: Admin, Técnico_

- [cite_start]**Planificador Semanal (`PlannerPage`):** Una interfaz visual `Drag & Drop` donde el `ADMIN` asigna visitas a técnicos[cite: 108]. [cite_start]El sistema ofrece feedback visual instantáneo sobre el estado de las visitas (verde para OK, rojo para incidencia)[cite: 109].
- **Parte de Trabajo Dinámico (`WorkOrderPage`):** La herramienta de campo del técnico. [cite_start]Es un formulario inteligente que se genera dinámicamente basado en la ficha de la piscina[cite: 112]. [cite_start]El técnico registra valores, marca tareas, añade productos consumidos y reporta incidencias con notas detalladas y **múltiples fotografías**[cite: 19, 113, 114].

### **ETAPA 3: SUPERVISIÓN Y GESTIÓN DE INCIDENCIAS (Control de Calidad Proactivo)**

_Roles: Admin, Técnico_

- [cite_start]**Dashboard del Administrador (`AdminDashboard`):** Una "torre de control" con widgets en tiempo real del estado de las visitas del día y una lista de incidencias activas que resaltan automáticamente las más críticas o antiguas[cite: 118, 120].
- **Gestión de Incidencias Avanzada (`IncidentDetailPage`):** Un centro de mando para la resolución de problemas. [cite_start]El `ADMIN` puede crear **Tareas de Seguimiento (`IncidentTask`)** accionables, asignarlas a cualquier usuario (admin, gerente o técnico) y establecer prioridades y fechas de plazo[cite: 8, 10]. [cite_start]Se establece un **hilo de comunicación bidireccional** con notificaciones automáticas para cada comentario o cambio de estado [cite: 16][cite_start], y todas las acciones quedan registradas en un **historial de auditoría inmutable**[cite: 12].

### **ETAPA 4: ANÁLISIS DE NEGOCIO (Inteligencia Financiera)**

_Roles: Admin, Gerencia_

- **Informe de Consumos y Costes (`ConsumptionReportPage`):**
  - **Doble Visión:** Permite generar tanto un informe de **Rentabilidad Interna** (basado en el coste de los productos) como un **Informe para Facturación** (basado en el precio de venta y las reglas del cliente).
  - **Desglose Interactivo (Drill-Down):** Su funcionalidad más potente. Permite auditar un coste desde el total anual de un cliente hasta el parte de trabajo original con unos pocos clics: `Coste Total Cliente ➔ Desglose por Producto ➔ Lista de Visitas ➔ Parte de Trabajo Específico`.
  - **Exportación para Facturación:** Todos los informes se pueden exportar a **CSV**, listos para ser utilizados en cualquier programa de contabilidad.

---

## 4. 🗺️ Hoja de Ruta y Visión de Futuro

### **Sprint Final v1.0 (Próximos 3 Días)**

Nuestro enfoque inmediato para tener una versión de presentación increíblemente potente.

- **Dashboard de Gerencia Avanzado:** Implementar la vista principal para el rol `MANAGER`, incluyendo los KPIs y gráficos de negocio, así como el "Selector de Vista" para actuar como otros roles.
- **Motor Financiero v2.0:** Implementar la lógica para manejar `Precios de Venta`, `IVA`, diferentes `Modelos de Facturación` por cliente (ej. "Todo Incluido") y `Reglas de Descuento` por producto o familia de productos.
- **Alertas Proactivas por Umbrales:** Desarrollar la lógica para notificar automáticamente a los administradores cuando los parámetros medidos se salgan de los rangos de seguridad.
- **Historial de Pagos y Saldos:** Implementar la capacidad de registrar pagos contra los informes de facturación y visualizar el estado de cuenta de un cliente.

### **Visión Post-v1.0**

- **Gestión de Inventario y Compras:** Un módulo completo para controlar el stock, definir mínimos y máximos, y generar informes de necesidades o propuestas de compra.
- **Modo Offline (PWA):** Permitir a los técnicos trabajar sin conexión a internet, sincronizando los datos automáticamente al recuperar la conexión.

### **Visión a Largo Plazo**

- **Módulo de Facturación y Contabilidad Completo:** La evolución final. Permitiría generar facturas con validez legal, gestionar impuestos, crear presupuestos y pedidos, y adaptarse a las normativas contables de diferentes países, convirtiendo a Pool-Control Professional en una solución ERP todo en uno para el sector.
