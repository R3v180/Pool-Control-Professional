# Documento de Especificación Funcional v2.0: Sistema "Pool-Control Professional"

**Fecha:** 9 de julio de 2025
**Proyecto:** Plataforma Integral de Gestión para Empresas de Mantenimiento de Piscinas.

---

## 1. Visión y Objetivos de Negocio

**Pool-Control Professional** es una plataforma SaaS multi-tenant diseñada para ser el sistema nervioso central de una empresa de mantenimiento de piscinas. Su propósito es erradicar la ineficiencia, eliminar el papel, controlar los costes y elevar la calidad del servicio a través de la digitalización y automatización de todos los procesos operativos.

#### Objetivos Clave:

- **Eficiencia Operativa Absoluta:** Transformar horas de trabajo administrativo en minutos. La planificación de rutas, la generación de partes de trabajo y la recopilación de datos deben ser procesos automáticos o semi-automáticos.
- **Control Total de la Rentabilidad:** Proporcionar una visión clara y en tiempo real del consumo de productos por visita, por piscina y por cliente, permitiendo un control de costes y una facturación precisa.
- **Calidad de Servicio Estandarizada y Proactiva:** Garantizar que cada técnico realice exactamente los mismos procedimientos definidos para cada piscina y que cualquier desviación o incidencia sea notificada al instante, pasando de un modelo reactivo a uno proactivo.
- **Toma de Decisiones Basada en Datos:** Ofrecer a la gerencia KPIs y métricas fiables sobre la operativa del negocio para identificar puntos de mejora, clientes más rentables y técnicos más eficientes.

---

## 2. Definición de Roles y Flujos de Autorización

El sistema se estructura en torno a roles con permisos estrictos para garantizar la seguridad y la focalización de cada usuario en sus responsabilidades.

| Rol                  | Misión Principal                                  | Capacidades Clave                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | Gestionar la plataforma y sus clientes (tenants). | CRUD completo sobre los **Tenants**. Gestión de suscripciones y ciclo de vida de las empresas que usan el software. No tiene visibilidad sobre los datos operativos (clientes, piscinas) de los tenants.                                                                                |
| **Admin (Isa)**      | Configurar y dirigir la operativa de su empresa.  | Control absoluto sobre la configuración del tenant: **definir el catálogo de servicios**, gestionar clientes y piscinas, **diseñar las fichas de mantenimiento**, planificar rutas, y supervisar toda la operativa. Es el "arquitecto" del servicio.                                    |
| **Técnico**          | Ejecutar el trabajo en campo de forma eficiente.  | Acceso exclusivo a su **ruta de trabajo del día**. Su única misión es ejecutar las visitas asignadas y rellenar los **partes de trabajo** con los datos requeridos. Interfaz 100% optimizada para móvil y diseñada para funcionar incluso en condiciones de baja conectividad (futuro). |
| **Gerencia (Jorge)** | Supervisar la salud y rendimiento del negocio.    | Acceso de **solo lectura** a toda la configuración y datos operativos del `ADMIN`. Su objetivo es el análisis a través de dashboards y reportes, sin la capacidad de alterar ningún dato, garantizando la integridad de la información.                                                 |

---

## 3. Flujo de Trabajo y Especificación Funcional Detallada

El sistema está diseñado como un ciclo continuo donde la configuración define la ejecución y la ejecución retroalimenta la supervisión.

### **ETAPA 1: Configuración del Servicio (Rol: Admin)**

Esta etapa es el corazón del sistema. El `ADMIN` define "el qué, cómo y cuándo" del servicio que ofrece su empresa.

#### **Pantalla: Catálogo de Servicios (Parámetros y Tareas)**

- **Propósito:** Crear una librería centralizada de todas las acciones y mediciones que la empresa puede realizar. Este es el primer paso y la base de todo.
- **Funcionalidad:**
  - **Gestión de Parámetros:** El `ADMIN` crea plantillas para cada medición (ej. "Nivel de pH", "Dureza del Agua"). Para cada una, define:
    - `Nombre`: "Nivel de pH"
    - `Unidad`: (opcional, ej. "ppm")
    - `Tipo de Input`: Define cómo el técnico introducirá el dato (`NUMBER`, `BOOLEAN` para Sí/No, `TEXT` o `SELECT` con opciones predefinidas como "Verde", "Turbia", "Cristalina").
  - **Gestión de Tareas:** El `ADMIN` crea plantillas para cada acción física (ej. "Limpieza de cestos de skimmers", "Cepillado de paredes").

#### **Pantalla: Gestión de Clientes y Piscinas**

- **Propósito:** Gestionar la cartera de clientes y sus activos (las piscinas).
- **Funcionalidad:**
  - **CRUD de Clientes:** El `ADMIN` gestiona la base de datos de clientes.
  - **CRUD de Piscinas:** Dentro de la ficha de cada cliente, el `ADMIN` puede añadir múltiples piscinas, cada una con su propia dirección y características (volumen, tipo, etc.). **Una piscina es el activo sobre el que se realizará el trabajo.**

#### **Pantalla: Constructor de Fichas de Mantenimiento (Pool Detail Page)**

- **Propósito:** Definir el "contrato de servicio" específico y único para **cada piscina**. Aquí es donde se conectan los catálogos con los activos.
- **Flujo de Trabajo:**
  1.  El `ADMIN` selecciona una piscina.
  2.  La interfaz le muestra los catálogos de parámetros y tareas disponibles.
  3.  **El `ADMIN` "arrastra" o añade los ítems del catálogo a la ficha de esa piscina.** Por ejemplo, para la "Piscina Comunitaria", añade "Nivel de pH", "Nivel de Cloro" y "Limpieza de cestos".
  4.  **Para cada ítem añadido, establece las reglas de negocio:**
      - `Frecuencia`: ¿Cada cuánto se debe realizar esta medición/tarea? (`DIARIA`, `SEMANAL`, `MENSUAL`...).
      - `Umbrales de Alerta` (para parámetros numéricos): ¿Cuál es el rango de valores aceptable? (ej. pH entre 7.2 y 7.6). Si el técnico introduce un valor fuera de este rango, el sistema lo marcará como una alerta.
  - **Resultado:** Cada piscina del sistema tiene una `PoolConfiguration` única que dictará exactamente qué debe hacer el técnico en cada visita.

### **ETAPA 2: Planificación y Ejecución (Roles: Admin y Técnico)**

#### **Pantalla: Planificador Semanal (Rol: Admin)**

- **Propósito:** Organizar la carga de trabajo de la semana y asignarla al equipo.
- **Flujo de Trabajo:**
  1.  El sistema, basándose en las `frecuencias` definidas en las fichas de cada piscina, **genera automáticamente una lista de "Visitas Pendientes"** para la semana.
  2.  El `ADMIN` ve una parrilla con los días de la semana y sus técnicos.
  3.  Simplemente **arrastra cada visita pendiente y la suelta sobre el técnico** y el día deseado. La asignación queda guardada.

#### **Pantalla: Mi Ruta de Hoy (Rol: Técnico)**

- **Propósito:** Proporcionar al técnico un plan de acción diario, claro, conciso y sin distracciones. **(FUNCIONALIDAD IMPLEMENTADA)**.
- **Flujo de Trabajo:**
  1.  El técnico inicia sesión en su móvil.
  2.  La aplicación le presenta una lista ordenada de las visitas que el `ADMIN` le ha asignado para el día de hoy.
  3.  Cada visita muestra la información esencial: nombre de la piscina y cliente.
  4.  La dirección es un enlace directo que **abre Google Maps/Apple Maps** con la ruta ya calculada.
  5.  Cada tarjeta de visita será un enlace para iniciar el "Parte de Trabajo".

#### **Pantalla: Parte de Trabajo Dinámico (Rol: Técnico)**

- **Propósito:** Registrar los datos de la visita de forma rápida, estructurada y a prueba de errores.
- **Flujo de Trabajo:**
  1.  Al hacer clic en una visita, se abre el parte. **Este formulario se construye dinámicamente** basándose en la `PoolConfiguration` de esa piscina. Si la ficha tiene 3 parámetros y 1 tarea, el técnico verá exactamente esos 4 campos.
  2.  El técnico rellena los valores. Si un valor está fuera de los `umbrales` definidos, la UI le dará feedback visual inmediato (ej. un borde rojo).
  3.  **Reporte de Incidencias:** Junto al campo de "Observaciones", habrá un **checkbox "Reportar como Incidencia"**. Si el técnico lo marca, al guardar el parte se generará una notificación interna para el `ADMIN`.
  4.  Al finalizar, el técnico guarda el parte. Los datos se envían a la API y se almacenan de forma inmutable.
- **Futuro (Modo Offline):** Se planifica que este formulario pueda ser rellenado sin conexión. Los datos se guardarían en el dispositivo y se sincronizarían automáticamente al recuperar la señal.

### **ETAPA 3: Supervisión y Análisis (Roles: Admin y Gerencia)**

#### **Pantalla: Historial de Visitas y Alertas (Rol: Admin)**

- **Propósito:** Permitir al `ADMIN` consultar el trabajo realizado y atender las incidencias reportadas.
- **Funcionalidad:**
  - El `ADMIN` podrá ver el historial de partes de trabajo de cualquier piscina.
  - Tendrá un "Centro de Notificaciones" donde aparecerán las incidencias reportadas por los técnicos, para poder gestionarlas.

#### **Pantalla: Dashboards y Reportes (Rol: Gerencia)**

- **Propósito:** Ofrecer una visión de alto nivel para la toma de decisiones estratégicas.
- **Funcionalidad:** Jorge, en modo **solo lectura**, accederá a paneles con KPIs como:
  - Rentabilidad por cliente.
  - Coste de productos consumidos vs. facturación.
  - Número de incidencias por mes.
  - Rendimiento y cumplimiento de los técnicos.
