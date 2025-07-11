# Pool-Control Professional: Especificación Funcional y Arquitectónica v4.0

| **Documentos de Apoyo:** | [Ver Plan de Desarrollo](./DEVELOPMENT_PLAN.md) | [Ver Estado del Proyecto](./PROJECT_STATUS.md) |
| :----------------------- | :---------------------------------------------- | :--------------------------------------------- |

---

## 1. Visión del Producto: El Sistema Nervioso para Empresas de Mantenimiento de Piscinas

**Pool-Control Professional** no es simplemente un software; es una plataforma SaaS (Software como Servicio) multi-tenant concebida para ser el **centro de operaciones digital e inteligente** de cualquier empresa dedicada al mantenimiento de piscinas.

Nuestra misión es erradicar las ineficiencias endémicas del sector: la dependencia del papel, la falta de control sobre los costes de materiales, la comunicación fragmentada entre la oficina y los técnicos, y la incapacidad de tomar decisiones estratégicas basadas en datos fiables.

A través de la digitalización y la automatización de cada proceso clave, transformamos la gestión reactiva en una **operativa proactiva, estandarizada y medible.**

#### **Pilares Estratégicos:**

- **Eficiencia Operativa Absoluta:** Automatizar o semi-automatizar tareas administrativas críticas como la planificación de rutas semanales y la generación de partes de trabajo, liberando horas de gestión para enfocarlas en el crecimiento del negocio.
- **Control Total de la Rentabilidad:** Proporcionar una visión granular y en tiempo real del consumo de productos químicos por visita, piscina y cliente. Este control es la base para una facturación precisa y una gestión de inventario inteligente.
- **Calidad de Servicio Estandarizada y Proactiva:** Garantizar que cada técnico, sin importar su experiencia, siga los procedimientos exactos definidos por la empresa para cada piscina. El sistema de notificaciones instantáneas convierte los problemas de reactivos a proactivos.
- **Inteligencia de Negocio Accionable:** Ofrecer a los roles de gerencia KPIs (Key Performance Indicators) y métricas fiables para identificar patrones, optimizar operaciones, detectar los clientes más rentables y evaluar el rendimiento del equipo.

---

## 2. Arquitectura de Roles y Flujos de Autorización

La plataforma se fundamenta en un sistema de roles estricto, diseñado para garantizar la seguridad, la integridad de los datos y la focalización de cada usuario en sus responsabilidades exclusivas.

| Rol                  | Misión Principal                                    | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**                   | Responsable del ciclo de vida de los tenants (las empresas que contratan el servicio). Realiza el CRUD completo sobre los **Tenants**, gestiona sus estados de suscripción (`TRIAL`, `ACTIVE`, `INACTIVE`) y crea el usuario `ADMIN` inicial para cada nueva empresa. Por diseño, no tiene ninguna visibilidad sobre los datos operativos de sus clientes (piscinas, técnicos, etc.).                                                            |
| **Admin (Isa)**      | **Diseñar y Dirigir la Operativa de su Empresa.**   | Es el "Arquitecto del Servicio". Su misión es configurar y supervisar. Define el **catálogo de servicios** (parámetros y tareas), gestiona la cartera de **clientes y piscinas**, diseña las **fichas de mantenimiento** personalizadas para cada activo, **planifica las rutas semanales** con una interfaz `Drag & Drop`, y **supervisa la operativa diaria** a través de un dashboard central y un potente sistema de gestión de incidencias. |
| **Técnico**          | **Ejecutar el Trabajo de Campo con Precisión.**     | Su interfaz está 100% optimizada para la eficiencia en movilidad. Su única misión es consultar su **ruta de trabajo del día**, desplazarse a la ubicación del cliente y rellenar el **parte de trabajo dinámico**, que se genera a medida para cada visita. Es el responsable de registrar los datos, marcar las tareas realizadas y reportar cualquier incidencia observada.                                                                    |
| **Gerencia (Jorge)** | **Analizar la Salud y el Rendimiento del Negocio.** | Un rol de **solo lectura** con acceso a toda la información operativa y de configuración. Su objetivo no es operar, sino analizar. A través de **dashboards y reportes de KPIs**, supervisa la rentabilidad, la eficiencia del equipo y el estado general del negocio, tomando decisiones estratégicas basadas en datos, sin la capacidad de alterar los registros para garantizar su integridad.                                                |

---

## 3. Especificación Funcional Detallada del Ciclo Operativo

El sistema opera como un ciclo virtuoso y continuo: **CONFIGURAR ➔ PLANIFICAR ➔ EJECUTAR ➔ SUPERVISAR**.

### **ETAPA 1: CONFIGURACIÓN (El Cerebro del Sistema)**

_Rol: Admin_

Aquí se define el ADN del servicio que ofrece la empresa.

#### **Pantallas: Catálogos de Parámetros y Tareas**

- **Propósito:** Crear una librería centralizada de "bloques de construcción" para cualquier servicio. Es el primer y más fundamental paso.
- **Funcionalidad Detallada:**
  - **Parámetros:** El `ADMIN` define plantillas para cada **medición** (ej: "Nivel de pH"). Establece su `Nombre`, `Unidad` (ppm, °C, etc.) y, crucialmente, el `Tipo de Input` que el técnico verá en su formulario (`NUMBER`, `BOOLEAN`, `TEXT` o `SELECT` con opciones personalizables).
  - **Tareas:** Se definen plantillas para cada **acción física** (ej: "Limpieza de cestos de skimmers"), con una descripción opcional.

#### **Pantalla: Constructor de Fichas de Mantenimiento (`PoolDetailPage`)**

- **Propósito:** Crear el "contrato de servicio" digital, único y específico para **cada piscina individual**.
- **Flujo de Trabajo Detallado:** El `ADMIN` navega a la ficha de una piscina. Allí, ve los catálogos de parámetros y tareas disponibles y los asocia a esa piscina. Para cada ítem asociado, define dos reglas de negocio clave:
  - **`Frecuencia`:** ¿Con qué periodicidad se debe realizar esta tarea o medición? (Diaria, Semanal, Quincenal, etc.).
  - **`Umbrales de Alerta`:** (Solo para parámetros numéricos) ¿Cuál es el rango de valores aceptable? (ej: pH entre 7.2 y 7.6). Si el técnico introduce un valor fuera de este rango, la UI le alertará visualmente.

### **ETAPA 2: PLANIFICACIÓN Y EJECUCIÓN (La Operativa)**

_Roles: Admin, Técnico_

#### **Pantalla: Planificador Semanal (`PlannerPage`)**

- **Propósito:** Organizar y asignar la carga de trabajo semanal de forma visual e intuitiva.
- **Funcionalidad Detallada:**
  - El sistema, basándose en las frecuencias definidas en las fichas, **genera automáticamente las visitas pendientes** para la semana.
  - El `ADMIN` ve una interfaz `Kanban` con una columna de "Visitas Pendientes" y una columna por cada técnico.
  - Mediante **`Drag and Drop`**, arrastra las visitas y las asigna al técnico y día deseados.
  - La interfaz proporciona **feedback visual instantáneo**, mostrando las visitas completadas con un estilo diferente (atenuadas, con borde de color) para un seguimiento rápido del progreso.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

#### **Pantalla: Parte de Trabajo Dinámico (`WorkOrderPage`)**

- **Propósito:** La herramienta de campo del técnico. Un formulario inteligente, a prueba de errores y que elimina el papel por completo.
- **Flujo de Trabajo Detallado:**
  1.  El `Técnico`, desde su ruta, accede a una visita. La `WorkOrderPage` se **construye dinámicamente** en ese instante, mostrando únicamente los campos y tareas definidos en la ficha de _esa_ piscina.
  2.  Rellena los valores. Los inputs se adaptan al tipo definido por el `ADMIN` (sliders, selectores, checkboxes, etc.).
  3.  **Reporte de Incidencias:** Dispone de un campo de texto libre para "Observaciones" y un **checkbox "Reportar como Incidencia"**. Si marca esta casilla, las notas que escriba se convertirán en el mensaje de una notificación para el `ADMIN`.
  4.  Al guardar, la visita se marca como `COMPLETED` y desaparece de su lista de tareas pendientes.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

### **ETAPA 3: SUPERVISIÓN Y ANÁLISIS (El Control de Calidad)**

_Roles: Admin, Gerencia_

Aquí es donde la información recopilada se convierte en inteligencia de negocio.

#### **Pantalla: Dashboard del Administrador (`AdminDashboard`)**

- **Propósito:** La "torre de control" del `ADMIN`. Una vista de un solo vistazo para entender el estado de la operativa del día.
- **Funcionalidad Detallada:**
  - **Widget de Visitas del Día:** Un resumen en tiempo real de las visitas de hoy, con su estado (`PENDIENTE`/`COMPLETADA`) y técnico asignado.
  - **Widget de Incidencias Activas:** Una lista priorizada de los problemas que requieren atención. Las incidencias que han superado un umbral de tiempo sin ser atendidas **se resaltan automáticamente en rojo**, asegurando que los problemas críticos nunca se ignoren.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

#### **Flujo de Gestión de Incidencias (Integrado)**

- **Propósito:** Proporcionar un ciclo de vida completo, trazable y profesional para la resolución de problemas.
- **Flujo de Trabajo Detallado:**
  1.  Una incidencia reportada llega al dashboard y a la campana 🔔 del `ADMIN`.
  2.  El `ADMIN` accede a una **vista de solo lectura del parte de trabajo original**, garantizando la inmutabilidad de los datos del técnico.
  3.  Desde esta vista, puede **"Clasificar"** la incidencia (asignando `Prioridad` y `Plazo de Resolución`) o **"Resolverla"**.
  4.  Para resolverla, añade sus propias **notas de resolución** y la marca como `RESOLVED`.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

#### **Pantalla: Historial de Incidencias (`IncidentsHistoryPage`)**

- **Propósito:** El archivo auditable y definitivo de la empresa.
- **Funcionalidad Detallada:**
  - Una potente tabla de datos que muestra **todas las incidencias históricas**.
  - Equipada con **filtrado por Cliente y Estado**, y **paginación gestionada por el backend** para un rendimiento óptimo con grandes volúmenes de datos.
  - Permite auditar el ciclo completo: qué pasó, quién lo reportó, qué solución se aplicó y cuándo.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

---

## 4. Próximas Funcionalidades Planificadas (Roadmap Futuro)

- **Gestión de Consumo de Productos:** Implementar el catálogo de productos y la capacidad para que los técnicos registren el material gastado en cada visita. **(Próxima gran funcionalidad)**.
- **Modo Offline (PWA):** Permitir que los técnicos completen sus partes de trabajo sin conexión a internet, sincronizándose automáticamente al recuperar la señal.
- **Sistema de Facturación:** Generar informes de consumo por cliente listos para ser facturados.
- **Dashboard de Gerencia Avanzado:** Desarrollar los KPIs y gráficos para el análisis de rentabilidad y rendimiento.
