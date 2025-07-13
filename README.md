# Pool-Control Professional: Especificación Funcional y Arquitectónica v10.0

| **Documentos de Apoyo:** | [Ver Plan de Desarrollo Estratégico](./DEVELOPMENT_PLAN.md) | [Ver Estado Actual del Proyecto](./PROJECT_STATUS.md) |
| :----------------------- | :---------------------------------------------------------- | :---------------------------------------------------- |

---

**Fecha de la Versión:** 13 de julio de 2025
**Proyecto:** Plataforma SaaS de Gestión Integral para Empresas de Mantenimiento de Piscinas.

---

## 1. 🎯 Visión del Producto: El Sistema Nervioso Inteligente de su Negocio

**Pool-Control Professional** no es una aplicación de gestión más; es una plataforma SaaS (Software como Servicio) concebida para ser el **centro de operaciones digital, proactivo e inteligente** que impulsa a las empresas de mantenimiento de piscinas hacia una nueva era de eficiencia, control y rentabilidad.

Nuestra misión es erradicar las ineficiencias sistémicas que lastran al sector: la dependencia del papel y la desorganización, la comunicación fragmentada que causa errores costosos, la falta de control sobre los costes de materiales y, sobre todo, la incapacidad de tomar decisiones estratégicas basadas en datos. A través de la digitalización, la automatización y la **inteligencia de negocio**, transformamos la gestión reactiva en una **operativa estandarizada, medible y, fundamentalmente, más rentable.**

---

## 2. 👥 Definición de Roles: Un Ecosistema Conectado y Flexible

La plataforma se fundamenta en un sistema de roles diseñado para que cada miembro del equipo tenga exactamente las herramientas que necesita, maximizando la eficiencia y la seguridad.

| Rol                  | Misión Principal                        | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**       | Responsable del ciclo de vida de los tenants (las empresas clientes). Realiza el CRUD completo sobre los **Tenants** y crea el usuario `ADMIN` inicial para cada nueva empresa. Por diseño, no tiene visibilidad alguna sobre los datos operativos de sus clientes, garantizando la máxima privacidad.                                                                                                                                                                                                                                                                                                                                                                              |
| **Admin (Isa)**      | **Orquestar la Operativa y Finanzas.**  | Es la "Arquitecta del Servicio". Su misión es configurar, planificar, supervisar y analizar. Define los catálogos de **servicios** y **productos**, gestiona **clientes** y **piscinas**, diseña las **fichas de mantenimiento**, establece los **modelos de facturación** y reglas de precios para cada cliente, planifica las **rutas semanales**, gestiona proactivamente las **incidencias** a través de un sistema de ticketing avanzado y analiza la **rentabilidad** con informes detallados.                                                                                                                                                                                |
| **Técnico**          | **Ejecutar con Precisión en Campo.**    | Su interfaz está 100% optimizada para la eficiencia en movilidad. Su flujo es simple y directo: consultar su **ruta de trabajo del día** (visitas y tareas especiales), rellenar el **parte de trabajo dinámico** (mediciones, tareas, consumo de productos) y reportar cualquier **incidencia** con notas y fotografías. Es notificado de cualquier actualización sobre sus tareas, manteniendo una comunicación fluida con la oficina.                                                                                                                                                                                                                                            |
| **Gerencia (Jorge)** | **Analizar y Actuar sobre el Negocio.** | 👑 **El Rol "Camaleón"**. Este es el rol más potente y flexible, diseñado para el propietario o gerente del negocio. Por defecto, opera en un **Modo Supervisor** de solo lectura, enfocado en el análisis estratégico a través de un dashboard con KPIs de alto nivel. Sin embargo, su característica clave es el **"Selector de Vista"**: en caso de necesidad (ej. cubrir una baja), el gerente puede asumir temporalmente la **Vista de Administración** o la **Vista de Técnico**, heredando todas sus funcionalidades. Cada acción realizada, sin importar la vista, queda registrada con su propio usuario, garantizando una auditoría completa y una responsabilidad total. |

---

## 3. ⚙️ Especificación Funcional: El Ciclo Virtuoso de Operaciones

El sistema opera como un ciclo continuo y perfectamente enlazado: **CONFIGURAR ➔ PLANIFICAR ➔ EJECUTAR ➔ SUPERVISAR ➔ ANALIZAR**.

### **ETAPA 1: CONFIGURACIÓN (El Cerebro Financiero y Operativo)**

_Rol: Admin_

- **Pantallas de Catálogos:** Aquí se define el ADN de la empresa.

  - **Productos:** Se gestiona el inventario, definiendo para cada producto su `coste` (para rentabilidad interna), su `salePrice` (PVP para el cliente), su `taxRate` (IVA) y su `ProductCategory` (familia).
  - **Parámetros y Tareas:** Se crea la librería de mediciones y acciones, definiendo tipos de datos, unidades y los **umbrales de alerta** (mín/máx) que activarán las notificaciones proactivas.

- **Ficha del Cliente (`ClientDetailPage`):** Mucho más que datos de contacto, es el centro de la relación comercial.
  - **Configuración Financiera:** Se establece la `monthlyFee` (cuota fija) y el `billingModel` (modelo de contrato: `Todo Incluido`, `Cuota + Materiales`, etc.).
  - **Reglas de Precios:** Se definen descuentos personalizados para ese cliente, ya sea sobre productos específicos o sobre familias enteras de productos (ej. "100% de descuento en toda la familia de 'Cloros'").

### **ETAPA 2: PLANIFICACIÓN Y EJECUCIÓN (El Corazón Operativo)**

_Roles: Admin, Técnico_

- **Planificador Semanal (`PlannerPage`):** Una interfaz visual `Drag & Drop` donde el `ADMIN` asigna visitas. La interfaz ofrece feedback visual instantáneo sobre el estado de las visitas (verde para OK, rojo para incidencia).
- **Parte de Trabajo Dinámico (`WorkOrderPage`):** La herramienta de campo del técnico. Un formulario inteligente generado a partir de la ficha de la piscina. El técnico registra valores y consumos, y puede reportar una **incidencia** con notas detalladas y **múltiples fotografías**.

### **ETAPA 3: SUPERVISIÓN Y GESTIÓN DE INCIDENCIAS (Control de Calidad Proactivo)**

_Roles: Admin, Gerencia, Técnico_

- **Dashboard del Administrador (`AdminDashboard`):** Una "torre de control" con widgets en tiempo real. Las **visitas son clicables** para un acceso directo al parte. Las incidencias activas se resaltan con un **borde rojo intenso** si son críticas.
- **Gestión de Incidencias Avanzada (`IncidentDetailPage`):** Un centro de mando para la resolución de problemas. El `ADMIN` puede crear **Tareas de Seguimiento (`IncidentTask`)** y asignarlas a **cualquier usuario**. Se establece un **hilo de comunicación bidireccional** con notificaciones automáticas para cada comentario o cambio de estado, y todas las acciones quedan registradas en un **historial de auditoría inmutable**.

### **ETAPA 4: ANÁLISIS Y GESTIÓN FINANCIERA (Inteligencia de Negocio)**

_Roles: Admin, Gerencia_

- **Página de Informes (`ConsumptionReportPage`):**
  - **Doble Visión:** Permite generar tanto un **Informe de Rentabilidad Interna** (basado en `coste` y gastos) como un **Informe para Facturación** (basado en `salePrice`, `monthlyFee` y reglas de descuento).
  - **Desglose Interactivo Total (Drill-Down):** Permite auditar un dato desde el nivel más alto hasta el origen: `Coste Total Cliente ➔ Desglose por Producto ➔ Lista de Visitas con ese consumo ➔ Parte de Trabajo original`.
  - **Exportación a CSV:** Permite descargar los datos para su uso en programas de contabilidad.
- **Registro de Pagos y Saldos:** En la ficha del cliente, se podrá registrar pagos y visualizar un historial, manteniendo un control claro sobre los saldos pendientes.

---

## 4. 🗺️ Hoja de Ruta y Visión de Futuro

### **Sprint Final v1.0 (Próximos 3 Días)**

Nuestro enfoque inmediato para tener una versión de presentación increíblemente potente.

- **Dashboard de Gerencia Avanzado:** Implementar la vista principal para el rol `MANAGER`, con KPIs y el "Selector de Vista".
- **Motor Financiero Completo:** Implementar la lógica para manejar `Precios de Venta`, `IVA`, `Modelos de Facturación` y `Reglas de Descuento`.
- **Alertas Proactivas por Umbrales:** Desarrollar la lógica para notificar automáticamente cuando los parámetros se salgan de los rangos de seguridad.
- **Historial de Pagos y Saldos:** Implementar la capacidad de registrar pagos y visualizar el estado de cuenta de un cliente.

### **Visión Post-v1.0**

- **Gestión de Inventario y Compras:** Un módulo completo para controlar el stock, definir mínimos/máximos y generar informes de necesidades o propuestas de compra.
- **Modo Offline (PWA):** Permitir a los técnicos trabajar sin conexión a internet.

### **Visión a Largo Plazo**

- **Módulo de Facturación y Contabilidad Completo:** La evolución final. Permitiría generar facturas con validez legal, gestionar impuestos, crear presupuestos y pedidos, y adaptarse a las normativas contables de diferentes países, convirtiendo a Pool-Control Professional en una solución ERP todo en uno para el sector.
