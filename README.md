// ====== [3] README.md ======

# Pool-Control Professional: Especificación Funcional y Arquitectónica v11.0

| **Documentos de Apoyo:** | [Ver Plan de Desarrollo Estratégico](./DEVELOPMENT_PLAN.md) | [Ver Estado Actual del Proyecto](./PROJECT_STATUS.md) |
| :----------------------- | :---------------------------------------------------------- | :---------------------------------------------------- |

---

**Fecha de la Versión:** 15 de julio de 2025
**Proyecto:** Plataforma SaaS de Gestión Integral para Empresas de Mantenimiento de Piscinas.

---

## 1. 🎯 Visión del Producto: El Sistema Nervioso Inteligente de su Negocio

**Pool-Control Professional** no es una aplicación de gestión más; es una plataforma SaaS (Software como Servicio) concebida para ser el **centro de operaciones digital, proactivo e inteligente** que impulsa a las empresas de mantenimiento de piscinas hacia una nueva era de eficiencia, control y rentabilidad.

Nuestra misión es erradicar las ineficiencias sistémicas que lastran al sector. A través de la digitalización, la automatización y la **inteligencia de negocio**, transformamos la gestión reactiva en una **operativa estandarizada, medible y, fundamentalmente, más rentable.**

---

## 2. 👥 Definición de Roles: Un Ecosistema Conectado y Flexible

La plataforma se fundamenta en un sistema de roles diseñado para maximizar la eficiencia y la seguridad.

| Rol                  | Misión Principal                        | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**       | Responsable del ciclo de vida de los tenants (las empresas clientes). Realiza el CRUD sobre los **Tenants** y crea el usuario `ADMIN` inicial para cada nueva empresa. Por diseño, no tiene visibilidad alguna sobre los datos operativos de sus clientes.                                                                                                                                                                                                                                  |
| **Admin (Isa)**      | **Orquestar la Operativa y Finanzas.**  | Es la "Arquitecta del Servicio". Su misión es **diseñar la operativa** y gestionar las excepciones. Define los catálogos, **Zonas geográficas**, y diseña las **Rutas Maestras** semanales. Supervisa la planificación automática, gestiona las incidencias a través de un sistema de ticketing, y analiza la rentabilidad. En el día a día, su foco es **gestionar las excepciones**: reasignar trabajo por bajas, reprogramar visitas vencidas y gestionar órdenes de trabajo especiales. |
| **Técnico**          | **Ejecutar con Precisión en Campo.**    | Su interfaz está 100% optimizada para la eficiencia en movilidad. Su flujo es simple y directo: consultar su **ruta de trabajo del día** (visitas y tareas especiales), rellenar el **parte de trabajo dinámico** y reportar cualquier **incidencia** con notas y fotografías. Es notificado de cualquier actualización sobre sus tareas.                                                                                                                                                   |
| **Gerencia (Jorge)** | **Analizar y Actuar sobre el Negocio.** | 👑 **El Rol "Camaleón"**. Este rol potente y flexible opera en un **Modo Supervisor** enfocado en el análisis estratégico a través de un **dashboard con KPIs interactivos**. Su característica clave es el **"Selector de Vista"**: puede asumir temporalmente la **Vista de Administración** para ayudar a planificar o la **Vista de Técnico** para cubrir una ruta. Todas sus acciones quedan auditadas, y puede ser asignatario directo de visitas y tareas.                           |

---

## 3. ⚙️ Especificación Funcional: El Ciclo Virtuoso de Operaciones

El sistema opera bajo el ciclo: **DISEÑAR ➔ PLANIFICAR (AUTOMÁTICO) ➔ EJECUTAR ➔ SUPERVISAR ➔ ANALIZAR**.

### **ETAPA 1: DISEÑO DE LA OPERATIVA (El Cerebro del Negocio)**

_Rol: Admin_

- **Configuración de Catálogos y Zonas:** Se define el ADN de la empresa: productos, servicios y **Zonas geográficas** de operación.
- **Ficha del Cliente (`ClientDetailPage`):** Es el centro de la relación comercial. Aquí se asigna el cliente a una **Zona** y se establecen sus condiciones financieras (`monthlyFee`, `billingModel`, reglas de precios).
- **Diseño de Rutas Maestras (`RouteTemplatesPage`):**
  - El `ADMIN` crea rutas (ej. "Lunes - Arenal") y les asocia **Zonas** y un **técnico habitual**.
  - **Gestión de Estacionalidad:** Para cada ruta, se definen periodos (ej. Verano, Invierno) con distintas **frecuencias de visita**.

### **ETAPA 2: PLANIFICACIÓN AUTOMÁTICA Y GESTIÓN DE EXCEPCIONES**

_Rol: Admin_

- **Generación Automática de Visitas:** Un proceso nocturno lee las Rutas Maestras y **genera automáticamente el calendario de visitas** para la semana, asignándolas al técnico correspondiente.
- **Planificador Semanal (`PlannerPage`):** La torre de control del `ADMIN`.
  - **Visualización:** Muestra el plan semanal generado automáticamente.
  - **Gestión de Deuda Operativa:** Una columna especial muestra las **visitas de días anteriores que quedaron pendientes**, forzando al `ADMIN` a reprogramarlas (arrastrándolas a un nuevo día).
  - **Gestión de Bajas:** El `ADMIN` puede marcar a un técnico como "no disponible", moviendo sus visitas a una columna de **"Trabajo Huérfano"** para una fácil reasignación a otros técnicos.
  - **Órdenes de Trabajo Especiales:** Permite crear visitas únicas y urgentes que no pertenecen a una ruta recurrente y asignarlas manualmente.

### **ETAPA 3: EJECUCIÓN Y REPORTE EN CAMPO**

_Rol: Técnico_

- **Ruta del Día Optimizada (`MyRoutePage`):** El técnico ve su lista de visitas para hoy, en el orden definido por el `ADMIN`.
- **Parte de Trabajo Dinámico (`WorkOrderPage`):** El técnico registra mediciones, tareas, consumos y reporta incidencias con fotos. El sistema puede generar **alertas automáticas** si un parámetro está fuera de los umbrales de seguridad.

### **ETAPA 4: SUPERVISIÓN Y ANÁLISIS**

_Roles: Admin, Gerencia_

- **Dashboard de Gerencia (`ManagerDashboard`):** Un centro de mando con KPIs dinámicos y widgets interactivos que permiten navegar desde una métrica general (ej. "Coste de Productos") hasta el detalle más profundo (el parte de trabajo que generó ese coste).
- **Gestión de Incidencias (`IncidentDetailPage`):** Sistema de ticketing avanzado para la resolución colaborativa de problemas.
- **Informes Financieros:** El sistema permite generar tanto informes de **Rentabilidad Interna** (basados en costes) como informes para **Facturación** (basados en precios de venta y cuotas).
- **Estado de Cuentas por Cliente (Planificado):** Una vista para controlar los saldos pendientes de cada cliente mes a mes, identificando pagos atrasados.

---

## 4. 🗺️ Hoja de Ruta y Visión de Futuro

Nuestro enfoque se centra en consolidar la plataforma como una solución ERP integral para el sector.

- **Sprint Actual:** Implementación del núcleo de la **Planificación Avanzada (Zonas y Rutas Maestras)**.
- **Próximos Pasos:**
  - **Alertas Proactivas por Umbrales:** Notificaciones automáticas por mediciones fuera de rango.
  - **Módulo de Estado de Cuentas:** Control de saldos y pagos pendientes.
  - **Gestión de Inventario y Compras.**
  - **Modo Offline (PWA) para Técnicos.**
