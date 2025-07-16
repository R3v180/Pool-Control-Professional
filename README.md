# Pool-Control Professional: Especificación Funcional y Arquitectónica v12.0

| **Documentos Estratégicos:** | [Ver Plan de Desarrollo](./DEVELOPMENT_PLAN.md) | [Ver Crónica del Proyecto](./PROJECT_STATUS.md) |
| :--------------------------- | :---------------------------------------------- | :---------------------------------------------- |

---

**Fecha de la Versión:** 16 de julio de 2025
**Proyecto:** Plataforma SaaS de Gestión Integral para Empresas de Mantenimiento de Piscinas.

---

## 1. 🎯 Visión del Producto: El Sistema Nervioso Inteligente de su Negocio

**Pool-Control Professional** no es una aplicación de gestión más; es una plataforma SaaS (Software como Servicio) concebida para ser el **centro de operaciones digital, proactivo e inteligente** que impulsa a las empresas de mantenimiento de piscinas hacia una nueva era de eficiencia, control y rentabilidad.

Nuestra misión es erradicar las ineficiencias sistémicas que lastran al sector: las rutas mal planificadas, la falta de comunicación entre la oficina y el campo, la gestión de cobros reactiva y la ausencia de datos para la toma de decisiones. A través de la **digitalización**, la **automatización** y la **inteligencia de negocio**, transformamos la gestión reactiva en una **operativa estandarizada, medible y, fundamentalmente, más rentable.**

---

## 2. 👥 Arquitectura de Roles: Un Ecosistema Conectado y Flexible

La plataforma se fundamenta en un sistema de roles diseñado para maximizar la eficiencia y la seguridad, donde cada usuario tiene una misión y las herramientas precisas para cumplirla.

| Rol                  | Misión Principal                        | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**       | Responsable del ciclo de vida de los _tenants_ (las empresas clientes). Realiza el alta de nuevas empresas, define sus subdominios y crea el usuario `ADMIN` inicial para cada una. Por diseño de seguridad y privacidad, no tiene visibilidad alguna sobre los datos operativos de sus clientes.                                                                                                                                                                                                                                   |
| **Admin (Isa)**      | **Orquestar la Operativa y Finanzas.**  | Es la "Arquitecta del Servicio". Su misión es **diseñar la operativa** y **gestionar las excepciones**. Define los catálogos, **Zonas geográficas**, y diseña las **Rutas Maestras** semanales. En el día a día, su foco no es la microgestión, sino la **resolución de imprevistos**: usa el **Centro de Mando (Planning Hub)** para reasignar trabajo por bajas, reprogramar visitas vencidas y gestionar órdenes de trabajo especiales. También supervisa la salud financiera a través del módulo de Estado de Cuentas.          |
| **Técnico**          | **Ejecutar con Precisión en Campo.**    | Su interfaz (`MyRoutePage`) está 100% optimizada para la eficiencia en movilidad. Su flujo es simple y directo: consultar su **ruta de trabajo del día** (que incluye visitas rutinarias y tareas de incidencia especiales), rellenar el **parte de trabajo dinámico** (`WorkOrderPage`) y reportar cualquier **incidencia** con notas y fotografías. Es notificado de cualquier actualización sobre sus tareas.                                                                                                                    |
| **Gerencia (Jorge)** | **Analizar y Actuar sobre el Negocio.** | 👑 **El Rol "Camaleón"**. Este rol potente y flexible opera por defecto en un **Modo Supervisor**, enfocado en el análisis estratégico a través de un **dashboard con KPIs interactivos** (`ManagerDashboard`). Su característica clave es el **"Selector de Vista"**: puede asumir temporalmente la **Vista de Administración** para ayudar a planificar o la **Vista de Técnico** para cubrir una ruta, heredando sus permisos y menús. Todas sus acciones quedan auditadas, y puede ser asignatario directo de visitas y tareas. |

---

## 3. ⚙️ Especificación Funcional: El Ciclo Virtuoso de Operaciones

El sistema opera bajo el ciclo: **DISEÑAR ➔ PLANIFICAR (AUTOMÁTICO) ➔ GESTIONAR EXCEPCIONES ➔ EJECUTAR ➔ ANALIZAR**.

### **ETAPA 1: DISEÑO DE LA OPERATIVA (El Cerebro del Negocio)**

_Rol: Admin_

- **Configuración de Catálogos y Zonas:** Se define el ADN de la empresa: productos y sus costes/precios, servicios, parámetros a medir y, fundamentalmente, las **Zonas geográficas** de operación.
- **Ficha del Cliente (`ClientDetailPage`):** Es el centro de la relación comercial. Aquí se asigna el cliente a una **Zona** y se establecen sus condiciones financieras (`monthlyFee`, `billingModel`, y reglas de precios personalizadas por producto o categoría).
- **Diseño de Rutas Maestras (`RouteTemplatesPage`):**
  - El `ADMIN` crea rutas (ej. "Lunes - Arenal") y les asocia **Zonas** y un **técnico habitual**.
  - **Gestión de Estacionalidad:** Para cada ruta, se definen períodos (ej. Verano, Invierno) con distintas **frecuencias de visita** (semanal, quincenal, etc.), permitiendo que la planificación se adapte automáticamente al volumen de trabajo estacional.

### **ETAPA 2: PLANIFICACIÓN AUTOMÁTICA Y GESTIÓN DE EXCEPCIONES (El Centro de Mando)**

_Rol: Admin_

- **Generación Automática de Visitas:** Un proceso nocturno en el backend lee las Rutas Maestras y **genera automáticamente el calendario de visitas** para las próximas semanas, asignándolas al técnico correspondiente y respetando la estacionalidad definida.
- **Centro de Mando (`PlannerPage`):** La torre de control del `ADMIN`. Ha sido diseñada para la **gestión ágil de imprevistos**:
  - **Visualización Inteligente:** Ofrece una vista de semana (para planificación general) y una vista de equipo por horas (para analizar la carga de trabajo diaria). Las **ausencias** de los técnicos se marcan visualmente, y el sistema **alerta con colores y iconos** si se asigna una visita a un técnico no disponible.
  - **Muelle de Carga:** Una barra lateral siempre visible que aísla los problemas:
    - **Deuda Operativa:** Muestra las visitas de días anteriores que quedaron pendientes, forzando al `ADMIN` a reprogramarlas.
    - **Trabajo Huérfano:** Agrupa automáticamente las visitas de técnicos que se han dado de baja o están de vacaciones.
  - **Acciones en Lote:** El `ADMIN` puede activar un **"Modo Selección"** para seleccionar múltiples visitas (del calendario o del muelle) y aplicar cambios masivos, como **reasignar todas a otro técnico** o **moverlas a otra fecha** con unos pocos clics.

### **ETAPA 3: EJECUCIÓN Y REPORTE EN CAMPO**

_Rol: Técnico_

- **Ruta del Día Optimizada (`MyRoutePage`):** El técnico ve una lista clara de su trabajo para hoy, que incluye tanto las visitas de mantenimiento programadas como las **tareas de incidencia especiales** que se le hayan asignado.
- **Parte de Trabajo Dinámico (`WorkOrderPage`):** Para cada visita, el técnico rellena un formulario digital donde registra mediciones, tareas realizadas, productos consumidos y puede adjuntar fotografías.
- **Sistema de Incidencias Integrado:** Si el técnico detecta un problema, puede marcar la visita como una **incidencia**, lo que crea automáticamente un ticket en el sistema para que el `ADMIN` lo gestione.

### **ETAPA 4: SUPERVISIÓN Y ANÁLISIS**

_Roles: Admin, Gerencia_

- **Dashboard de Gerencia (`ManagerDashboard`):** Un centro de mando con KPIs dinámicos sobre la salud financiera, el estado de las incidencias, la rentabilidad por cliente y el **rendimiento del equipo** (visitas vs. tareas completadas por técnico).
- **Gestión de Incidencias (`IncidentDetailPage`):** Un sistema de ticketing avanzado que permite crear **tareas de seguimiento**, asignarlas a técnicos específicos con plazos y mantener un historial de comunicación para la resolución colaborativa de problemas.
- **Informes Financieros:**
  - **Informe para Facturación:** Genera un resumen de los importes a facturar a cada cliente en un período, desglosando cuotas y materiales.
  - **Informe de Consumos:** Detalla los costes de los productos utilizados, permitiendo analizar la rentabilidad.
- **Estado de Cuentas por Cliente (`AccountStatusPage`):**
  - **Visión General:** Muestra una tabla con todos los clientes, el total facturado, el total pagado y el **saldo pendiente** en un período de tiempo seleccionable.
  - **Trazabilidad Total:** Cada fila de cliente es expandible, permitiendo al gerente ver un **desglose detallado mes a mes** de la deuda y los pagos aplicados, para poder justificar cualquier importe al momento.
