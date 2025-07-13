# Pool-Control Professional: Especificación Funcional y Arquitectónica v8.0

| **Documentos de Apoyo:** | [Ver Plan de Desarrollo](./DEVELOPMENT_PLAN.md) | [Ver Estado del Proyecto](./PROJECT_STATUS.md) |
| :----------------------- | :---------------------------------------------- | :--------------------------------------------- |

---

**Fecha de la Versión:** 13 de julio de 2025
**Proyecto:** Plataforma Integral de Gestión para Empresas de Mantenimiento de Piscinas.

---

## 1. Visión del Producto: El Sistema Nervioso para Empresas de Mantenimiento de Piscinas

**Pool-Control Professional** no es simplemente un software; es una plataforma SaaS (Software como Servicio) multi-tenant concebida para ser el **centro de operaciones digital e inteligente** de cualquier empresa dedicada al mantenimiento de piscinas.

Nuestra misión es erradicar las ineficiencias endémicas del sector: la dependencia del papel, la falta de control sobre los costes de materiales, la comunicación fragmentada entre la oficina y los técnicos, y la incapacidad de tomar decisiones estratégicas basadas en datos fiables. A través de la digitalización y la automatización de cada proceso clave, transformamos la gestión reactiva en una **operativa proactiva, estandarizada, rentable e inteligente.**

#### **Pilares Estratégicos:**

- **Eficiencia Operativa Absoluta:** Automatizar o semi-automatizar tareas administrativas críticas, liberando horas de gestión para enfocarlas en el crecimiento del negocio.
- **Control Total de la Rentabilidad:** Proporcionar una visión granular y en tiempo real del consumo de productos químicos y materiales por visita, piscina y cliente. Este es el pilar para una gestión de costes y una facturación precisas.
- **Calidad de Servicio Estandarizada y Proactiva:** Garantizar que cada técnico siga los procedimientos exactos definidos por la empresa y que cualquier incidencia sea gestionada y resuelta de forma trazable y eficiente.
- **Inteligencia de Negocio Accionable:** Ofrecer a los roles de gerencia KPIs y métricas fiables para identificar patrones, optimizar operaciones y fundamentar decisiones estratégicas.

---

## 2. Definición de Roles y Flujos de Autorización

La plataforma se fundamenta en un sistema de roles estricto y flexible, diseñado para garantizar la seguridad, la integridad de los datos y la focalización de cada usuario en sus responsabilidades.

| Rol                  | Misión Principal                                  | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**                 | Responsable del ciclo de vida de los tenants (las empresas que contratan el servicio). Realiza el CRUD completo sobre los **Tenants**, gestiona sus estados de suscripción y crea el usuario `ADMIN` inicial para cada nueva empresa. Por diseño, no tiene ninguna visibilidad sobre los datos operativos de sus clientes.                                                                                                                                                                                                                     |
| **Admin (Isa)**      | **Diseñar y Dirigir la Operativa de su Empresa.** | Es la "Arquitecta del Servicio". Su misión es configurar, planificar y supervisar. Define los catálogos de **servicios** y **productos**, gestiona la cartera de **clientes y piscinas**, diseña las **fichas de mantenimiento**, planifica las **rutas semanales** con una interfaz `Drag & Drop`, y supervisa la operativa a través de un **dashboard central**, un potente sistema de **gestión de incidencias** y un **módulo de informes de rentabilidad**.                                                                               |
| **Técnico**          | **Ejecutar el Trabajo de Campo con Precisión.**   | Su interfaz está 100% optimizada para la eficiencia en movilidad. Su misión principal es consultar su **ruta de trabajo del día** (visitas y tareas especiales) y rellenar el **parte de trabajo dinámico**. Es responsable de registrar mediciones, tareas, **consumo de productos** y reportar cualquier incidencia con notas y fotografías. Recibe notificaciones sobre cambios o comentarios en sus tareas asignadas.                                                                                                                      |
| **Gerencia (Jorge)** | **Analizar y Actuar sobre la Salud del Negocio.** | 👑 **Rol "Camaleón" con Vistas Conmutables.** Por defecto, opera en un **modo Supervisor** de solo lectura, enfocado en el análisis estratégico a través de dashboards y reportes de KPIs. Sin embargo, en caso de necesidad (ej. cubrir una baja), puede activar una **Vista de Administración** o una **Vista de Técnico** para asumir temporalmente todas las capacidades de esos roles. Cada acción que realiza en cualquier modo queda registrada con su propio usuario, garantizando una auditoría completa y una responsabilidad total. |

---

## 3. Especificación Funcional Detallada del Ciclo Operativo

El sistema opera como un ciclo virtuoso y continuo: **CONFIGURAR ➔ PLANIFICAR ➔ EJECUTAR ➔ SUPERVISAR ➔ ANALIZAR**.

### **ETAPA 1: CONFIGURACIÓN (El Cerebro del Sistema)**

_Rol: Admin_

- **Propósito:** Crear la librería centralizada de todas las acciones, mediciones y materiales de la empresa.
- **Funcionalidades:** Creación de catálogos de **Parámetros** (con tipos de datos y umbrales), **Tareas** y **Productos** (con unidad y coste). Diseño de **Fichas de Mantenimiento** únicas por piscina.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

### **ETAPA 2: PLANIFICACIÓN Y EJECUCIÓN (La Operativa)**

_Roles: Admin, Técnico_

- **Propósito:** Organizar el trabajo semanal y ejecutarlo en campo.
- **Funcionalidades:**
  - **Planificador Semanal (`PlannerPage`):** Interfaz `Drag & Drop` para asignar visitas a técnicos, con feedback visual instantáneo sobre el estado de las visitas.
  - **Parte de Trabajo Dinámico (`WorkOrderPage`):** Formulario inteligente generado a partir de la ficha de la piscina para que el técnico registre mediciones, tareas, consumo de productos y reporte incidencias con fotos.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

### **ETAPA 3: SUPERVISIÓN Y GESTIÓN DE INCIDENCIAS (Control de Calidad)**

_Roles: Admin, Técnico_

- **Propósito:** Un sistema de ticketing robusto y trazable para la resolución proactiva de problemas.
- **Funcionalidades:**
  - **Dashboard del Administrador (`AdminDashboard`):** Torre de control con widgets de visitas del día e incidencias activas. Las incidencias antiguas o críticas se resaltan automáticamente.
  - **Flujo de Ticketing Avanzado:**
    1.  El `ADMIN` es notificado de una incidencia y accede a la `IncidentDetailPage`.
    2.  Desde allí, puede crear **Tareas de Seguimiento (`IncidentTask`)** accionables, asignándolas a un técnico con prioridad y fecha de plazo.
    3.  Se inicia un **hilo de comunicación** donde tanto el admin como el técnico pueden añadir comentarios y recibir notificaciones de cada actualización. El técnico puede cambiar el estado de la tarea (`PENDIENTE`, `EN PROGRESO`, `COMPLETADA`) y solicitar aplazamientos.
    4.  Todo el ciclo de vida de la tarea queda registrado en un **historial de auditoría** inmutable.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

### **ETAPA 4: ANÁLISIS DE NEGOCIO (Inteligencia y Rentabilidad)**

_Roles: Admin, Gerencia_

- **Propósito:** Convertir los datos operativos en métricas de negocio para una toma de decisiones informada.
- **Funcionalidades:**
  - **Informe de Consumos y Costes (`ConsumptionReportPage`):**
    1.  **Filtros Potentes:** Permite generar informes por rangos de fecha y por cliente (o todos los clientes).
    2.  **KPIs y Resumen:** Muestra tarjetas con los costes totales y un resumen por cliente.
    3.  **Desglose Interactivo (Drill-Down):** Cada fila de cliente es expandible para mostrar un desglose de los productos consumidos. A su vez, cada producto es clicable para mostrar un listado de las visitas exactas donde se utilizó, con un enlace directo al parte de trabajo original.
    4.  **Exportación:** Permite descargar el informe completo en formato **CSV** para su análisis en Excel o para la facturación.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

---

## 4. Próximas Funcionalidades Planificadas (Roadmap Futuro)

- **Dashboard de Gerencia Avanzado:** Implementar la vista principal para el rol `MANAGER`, incluyendo los KPIs y gráficos de negocio, así como el "Selector de Vista" para actuar como otros roles. **(Próxima gran funcionalidad)**.
- **Alertas Proactivas por Umbrales:** Desarrollar la lógica de backend para notificar automáticamente a los administradores cuando los parámetros medidos por los técnicos se salgan de los rangos de seguridad establecidos.
- **Modo Offline (PWA):** Permitir a los técnicos rellenar y guardar partes de trabajo sin conexión a internet, para su posterior sincronización.
- **Sistema de Facturación y Gestión de Inventario:** Evolucionar el módulo de informes y productos hacia un sistema completo que pueda generar facturas y controlar el stock.
