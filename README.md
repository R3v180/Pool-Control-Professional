# Documento de Especificación Funcional v3.0: Sistema "Pool-Control Professional"

**Documentos del Proyecto:**
[Ver Plan de Desarrollo](./DEVELOPMENT_PLAN.md) | [Ver Estado del Proyecto](./PROJECT_STATUS.md)

---

**Fecha:** 10 de julio de 2025
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

| Rol                  | Misión Principal                                  | Capacidades Clave                                                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**       | Gestionar la plataforma y sus clientes (tenants). | CRUD completo sobre los **Tenants**. Gestión de suscripciones y ciclo de vida de las empresas que usan el software. No tiene visibilidad sobre los datos operativos (clientes, piscinas) de los tenants.                                                                                                                |
| **Admin (Isa)**      | Configurar y dirigir la operativa de su empresa.  | Control absoluto sobre la configuración del tenant: **definir el catálogo de servicios**, gestionar clientes y piscinas, **diseñar las fichas de mantenimiento**, planificar rutas, y supervisar toda la operativa a través de un **dashboard central y un centro de notificaciones**. Es el "arquitecto" del servicio. |
| **Técnico**          | Ejecutar el trabajo en campo de forma eficiente.  | Acceso exclusivo a su **ruta de trabajo del día**. Su única misión es ejecutar las visitas asignadas y rellenar los **partes de trabajo** con los datos requeridos. Interfaz 100% optimizada para móvil y diseñada para funcionar incluso en condiciones de baja conectividad (futuro).                                 |
| **Gerencia (Jorge)** | Supervisar la salud y rendimiento del negocio.    | Acceso de **solo lectura** a toda la configuración y datos operativos del `ADMIN`. Su objetivo es el análisis a través de dashboards y reportes, sin la capacidad de alterar ningún dato, garantizando la integridad de la información.                                                                                 |

---

## 3. Flujo de Trabajo y Especificación Funcional Detallada

El sistema está diseñado como un ciclo continuo donde la configuración define la ejecución y la ejecución retroalimenta la supervisión.

### **ETAPA 1: Configuración del Servicio (Rol: Admin)**

Esta etapa es el corazón del sistema. El `ADMIN` define "el qué, cómo y cuándo" del servicio que ofrece su empresa.

#### **Pantalla: Catálogo de Servicios (Parámetros y Tareas)**

- **Propósito:** Crear una librería centralizada de todas las acciones y mediciones que la empresa puede realizar. Este es el primer paso y la base de todo.
- **Funcionalidad:**
  - **Gestión de Parámetros:** El `ADMIN` crea plantillas para cada medición (ej. "Nivel de pH"). Para cada una, define su `Nombre`, `Unidad` y `Tipo de Input` (`NUMBER`, `BOOLEAN`, `TEXT` o `SELECT` con opciones).
  - **Gestión de Tareas:** El `ADMIN` crea plantillas para cada acción física (ej. "Limpieza de cestos de skimmers").

#### **Pantalla: Gestión de Clientes y Piscinas**

- **Propósito:** Gestionar la cartera de clientes y sus activos (las piscinas).
- **Funcionalidad:**
  - **CRUD de Clientes:** El `ADMIN` gestiona la base de datos de clientes.
  - **CRUD de Piscinas:** Dentro de la ficha de cada cliente, el `ADMIN` puede añadir múltiples piscinas.

#### **Pantalla: Constructor de Fichas de Mantenimiento (Pool Detail Page)**

- **Propósito:** Definir el "contrato de servicio" específico y único para **cada piscina**.
- **Flujo de Trabajo:** El `ADMIN` asocia ítems de los catálogos a la ficha de esa piscina y, para cada uno, establece las reglas de negocio: `Frecuencia` (¿Cada cuánto?) y `Umbrales de Alerta` (¿Cuál es el rango aceptable?).

### **ETAPA 2: Planificación y Ejecución (Roles: Admin y Técnico)**

#### **Pantalla: Planificador Semanal (Rol: Admin)**

- **Propósito:** Organizar la carga de trabajo de la semana y asignarla al equipo.
- **Flujo de Trabajo:** El sistema genera automáticamente las visitas pendientes según la frecuencia. El `ADMIN` las arrastra y suelta sobre el técnico y día deseado.

#### **Pantalla: Mi Ruta de Hoy (Rol: Técnico)**

- **Propósito:** Proporcionar al técnico un plan de acción diario, claro y directo.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.
- **Flujo de Trabajo:** Al iniciar sesión, el técnico ve una lista ordenada de sus visitas `PENDIENTES` para el día. La dirección es un enlace a Google Maps/Apple Maps y cada tarjeta de visita conduce al "Parte de Trabajo".

#### **Pantalla: Parte de Trabajo Dinámico (Rol: Técnico)**

- **Propósito:** Registrar los datos de la visita de forma rápida, estructurada y a prueba de errores.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.
- **Flujo de Trabajo:**
  1.  Al entrar, la página construye un **formulario dinámico** basado en la configuración de la piscina.
  2.  El técnico rellena los valores. La UI le proporciona feedback instantáneo si un valor está fuera de los umbrales.
  3.  **Reporte de Incidencias:** Junto a un campo de "Observaciones", el técnico dispone de un **checkbox "Reportar como Incidencia"**. Si lo marca, al guardar el parte se generará una notificación interna automática para el `ADMIN`, informándole del problema.
  4.  Al guardar, los datos se envían a la API, la visita se marca como `COMPLETED` y desaparece de la lista de tareas pendientes del técnico.

### **ETAPA 3: Supervisión y Análisis (Roles: Admin y Gerencia)**

#### **Pantalla: Dashboard del Administrador**

- **Propósito:** Ofrecer al `ADMIN` una visión de 360 grados del estado de la operativa diaria, centralizando la información más crítica.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.
- **Funcionalidad Detallada:**
  - **Visitas del Día:** Un widget principal muestra en tiempo real todas las visitas programadas para hoy, con el técnico asignado y su estado (`PENDIENTE` o `COMPLETADA`), permitiendo un seguimiento rápido del progreso del equipo.
  - **Centro de Incidencias Activas:** Un segundo widget destaca las incidencias que están actualmente en estado `PENDING`, asegurando que los problemas urgentes sean la prioridad número uno. Cada incidencia es un enlace directo al parte de trabajo donde se originó.

#### **Pantalla: Gestión de Incidencias (Integrada en el flujo)**

- **Propósito:** Dotar al `ADMIN` de un sistema robusto y trazable para gestionar los problemas reportados desde el campo.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.
- **Flujo de Trabajo:**
  1.  Una incidencia reportada por un técnico aparece en el Dashboard y en la "campana" de notificaciones del `ADMIN`.
  2.  El `ADMIN` hace clic en la notificación y es redirigido a una **vista de solo lectura del parte de trabajo original**. Esto garantiza la integridad de los datos: el parte del técnico no puede ser alterado.
  3.  En esta vista, el `ADMIN` tiene un botón para **"Gestionar Incidencia"**. Al pulsarlo, se abre un modal donde puede:
      - Revisar las notas del técnico.
      - Añadir sus propias **notas de resolución** (ej. "Se ha hablado con el cliente, se aprueba cambio de pieza").
      - Marcar la incidencia como **"Resuelta"**.
  4.  Una vez resuelta, la incidencia desaparece del dashboard principal para mantener la interfaz enfocada en los problemas activos.

#### **Pantalla: Historial de Incidencias**

- **Propósito:** Proporcionar un registro completo y auditable de todos los problemas gestionados, fundamental para el análisis de calidad y la resolución de disputas.
- **Estado de Implementación:** `COMPLETADA Y OPERATIVA`.
- **Funcionalidad Detallada:** Una nueva sección en la aplicación muestra una tabla con el historial de todas las incidencias (pendientes y resueltas). Se puede consultar la fecha, piscina, técnico, el problema reportado y la solución aplicada por el `ADMIN`, con un enlace permanente al parte de trabajo original.

#### **Pantalla: Dashboards y Reportes (Rol: Gerencia)**

- **Propósito:** Ofrecer una visión de alto nivel para la toma de decisiones estratégicas.
- **Funcionalidad Prevista:** Jorge, en modo **solo lectura**, accederá a paneles con KPIs sobre rentabilidad, costes, incidencias y rendimiento de los técnicos.
