# Pool-Control Professional: Especificación Funcional y Arquitectónica v5.0

| **Documentos de Apoyo:** | [Ver Plan de Desarrollo](./DEVELOPMENT_PLAN.md) | [Ver Estado del Proyecto](./PROJECT_STATUS.md) |
| :----------------------- | :---------------------------------------------- | :--------------------------------------------- |

---

**Fecha de la Versión:** 12 de julio de 2025
**Proyecto:** Plataforma Integral de Gestión para Empresas de Mantenimiento de Piscinas.

---

## 1. Visión del Producto: El Sistema Nervioso para Empresas de Mantenimiento de Piscinas

**Pool-Control Professional** no es simplemente un software; es una plataforma SaaS (Software como Servicio) multi-tenant concebida para ser el **centro de operaciones digital e inteligente** de cualquier empresa dedicada al mantenimiento de piscinas.

Nuestra misión es erradicar las ineficiencias endémicas del sector: la dependencia del papel, la falta de control sobre los costes de materiales, la comunicación fragmentada entre la oficina y los técnicos, y la incapacidad de tomar decisiones estratégicas basadas en datos fiables.

A través de la digitalización y la automatización de cada proceso clave, transformamos la gestión reactiva en una **operativa proactiva, estandarizada, rentable y medible.**

#### **Pilares Estratégicos:**

- **Eficiencia Operativa Absoluta:** Automatizar o semi-automatizar tareas administrativas críticas, liberando horas de gestión para enfocarlas en el crecimiento del negocio.
- **Control Total de la Rentabilidad:** Proporcionar una visión granular y en tiempo real del consumo de productos químicos y materiales por visita, piscina y cliente. Este es el pilar para una gestión de costes y una facturación precisas.
- **Calidad de Servicio Estandarizada y Proactiva:** Garantizar que cada técnico siga los procedimientos exactos definidos por la empresa para cada piscina y que cualquier incidencia sea notificada, gestionada y resuelta de forma trazable.
- **Inteligencia de Negocio Accionable:** Ofrecer a los roles de gerencia KPIs y métricas fiables para identificar patrones, optimizar operaciones y fundamentar decisiones estratégicas.

---

## 2. Definición de Roles y Flujos de Autorización

La plataforma se fundamenta en un sistema de roles estricto, diseñado para garantizar la seguridad, la integridad de los datos y la focalización de cada usuario en sus responsabilidades exclusivas.

| Rol                  | Misión Principal                                    | Capacidades Clave y Flujo de Trabajo Detallado                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | **Gestionar la Plataforma SaaS.**                   | Responsable del ciclo de vida de los tenants (las empresas que contratan el servicio). Realiza el CRUD completo sobre los **Tenants**, gestiona sus estados de suscripción y crea el usuario `ADMIN` inicial para cada nueva empresa. Por diseño, no tiene ninguna visibilidad sobre los datos operativos de sus clientes.                                                                                            |
| **Admin (Isa)**      | **Diseñar y Dirigir la Operativa de su Empresa.**   | Es el "Arquitecto del Servicio". Su misión es configurar, planificar y supervisar. Define los catálogos de **servicios** y **productos**, gestiona la cartera de **clientes y piscinas**, diseña las **fichas de mantenimiento**, planifica las **rutas semanales** con una interfaz `Drag & Drop`, y supervisa la operativa a través de un **dashboard central** y un potente sistema de **gestión de incidencias**. |
| **Técnico**          | **Ejecutar el Trabajo de Campo con Precisión.**     | Su interfaz está 100% optimizada para la eficiencia en movilidad. Su única misión es consultar su **ruta de trabajo del día**, desplazarse al cliente y rellenar el **parte de trabajo dinámico**. Es el responsable de registrar los datos de mediciones, las tareas realizadas, el **consumo de productos** y reportar cualquier incidencia.                                                                        |
| **Gerencia (Jorge)** | **Analizar la Salud y el Rendimiento del Negocio.** | Un rol de **solo lectura** con acceso a toda la información operativa y de configuración. Su objetivo no es operar, sino analizar. A través de **dashboards y reportes de KPIs**, supervisa la rentabilidad, la eficiencia del equipo y el estado general del negocio, tomando decisiones estratégicas basadas en datos.                                                                                              |

---

## 3. Especificación Funcional Detallada del Ciclo Operativo

El sistema opera como un ciclo virtuoso y continuo: **CONFIGURAR ➔ PLANIFICAR ➔ EJECUTAR ➔ SUPERVISAR Y ANALIZAR**.

### **ETAPA 1: CONFIGURACIÓN (El Cerebro del Sistema)**

_Rol: Admin_

Aquí se define el ADN del servicio que ofrece la empresa.

#### **Pantallas: Catálogos de Servicios y Productos**

- **Propósito:** Crear una librería centralizada de todas las acciones, mediciones y materiales de la empresa.
- **Funcionalidad Detallada:**
  - **Catálogo de Parámetros:** El `ADMIN` define plantillas para cada **medición** (ej: "Nivel de pH"), estableciendo su `Nombre`, `Unidad` y `Tipo de Input` (`NUMBER`, `BOOLEAN`, `TEXT`, `SELECT`).
  - **Catálogo de Tareas:** Se definen plantillas para cada **acción física** (ej: "Limpieza de cestos de skimmers").
  - **Catálogo de Productos:** Se define el inventario de productos químicos y materiales, especificando `Nombre`, `Unidad` de medida (L, Kg, Saco, etc.) y, fundamentalmente, el **`Coste`** por unidad para el cálculo de rentabilidad.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

#### **Pantalla: Constructor de Fichas de Mantenimiento**

- **Propósito:** Definir el "contrato de servicio" digital y único para **cada piscina**.
- **Flujo de Trabajo:** El `ADMIN` asocia ítems de los catálogos a cada piscina, estableciendo reglas de negocio como la `Frecuencia` y los `Umbrales de Alerta`.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

### **ETAPA 2: PLANIFICACIÓN Y EJECUCIÓN (La Operativa)**

_Roles: Admin, Técnico_

#### **Pantalla: Planificador Semanal (`PlannerPage`)**

- **Propósito:** Organizar y asignar la carga de trabajo semanal de forma visual.
- **Funcionalidad Detallada:** El sistema genera las visitas pendientes y el `ADMIN` las asigna a los técnicos mediante `Drag & Drop`. La interfaz ofrece **feedback visual instantáneo**, atenuando y coloreando las visitas completadas (verde para OK, rojo para incidencia) para un seguimiento rápido. Cada visita es clicable para un acceso directo a los detalles.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

#### **Pantalla: Parte de Trabajo Dinámico (`WorkOrderPage`)**

- **Propósito:** La herramienta de campo del técnico, diseñada para ser rápida, inteligente y a prueba de errores.
- **Flujo de Trabajo Detallado:**
  1.  La página construye un **formulario dinámico** basado en la ficha de mantenimiento de la piscina.
  2.  El técnico rellena los valores de **parámetros**, marca las **tareas** realizadas y registra el **consumo de productos** desde el catálogo.
  3.  Reporta **incidencias** a través de un campo de observaciones, cuyas notas se convierten en el mensaje de alerta para el `ADMIN`.
  4.  Al guardar, todos los datos (resultados, tareas, consumos, notas) se envían a la API en una única transacción atómica.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

### **ETAPA 3: SUPERVISIÓN Y ANÁLISIS (El Control de Calidad y Negocio)**

_Roles: Admin, Gerencia_

Aquí es donde la información recopilada se convierte en inteligencia accionable.

#### **Pantalla: Dashboard del Administrador (`AdminDashboard`)**

- **Propósito:** La "torre de control" del `ADMIN`, ofreciendo una visión de 360 grados de la operativa diaria.
- **Funcionalidad Detallada:**
  - **Widget de Visitas del Día:** Resumen en tiempo real de las visitas de hoy, con su estado y técnico, diferenciando visualmente las pendientes de las completadas.
  - **Widget de Incidencias Activas:** Una lista priorizada de problemas. Las incidencias que superan un umbral de tiempo **se resaltan automáticamente en rojo**. Los mensajes muestran las notas reales del técnico.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

#### **Flujo y Pantalla de Gestión de Incidencias**

- **Propósito:** Un sistema de "ticketing" robusto y trazable para la resolución de problemas.
- **Flujo de Trabajo:** El `ADMIN` es notificado, accede a una **vista de solo lectura** del parte (garantizando la integridad de los datos), y desde allí puede **"Clasificar"** la incidencia (asignando prioridad y plazo) o **"Resolverla"** (añadiendo notas de resolución).
- **Pantalla de Historial:** Una tabla potente con **filtrado y paginación por backend** muestra el archivo completo de todas las incidencias para una auditoría total.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.

---

## 4. Próximas Funcionalidades Planificadas (Roadmap Futuro)

- **Módulo de Informes de Consumo:** Crear una nueva sección para analizar la rentabilidad, con filtros por cliente y fecha, KPIs de costes y la capacidad de **exportar los datos a CSV/Excel** para la facturación. **(Próxima gran funcionalidad)**.
- **Flujo de Trabajo Avanzado para Incidencias:** Evolucionar el sistema de incidencias para que puedan generar "tareas de seguimiento" asignables a técnicos o servicios externos.
- **Modo Offline (PWA):** Permitir a los técnicos trabajar sin conexión a internet.
- **Dashboard de Gerencia Avanzado:** Desarrollar los gráficos y KPIs para el análisis estratégico del negocio.
- **Sistema de Facturación y Gestión de Inventario.**
