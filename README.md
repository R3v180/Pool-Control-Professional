# Documento de Especificación Funcional v1.0: Sistema "Pool-Control Professional"

**Fecha:** 8 de julio de 2025
**Autor:** Pool-Control Professional Team
**Proyecto:** Plataforma Integral de Gestión para Empresas de Mantenimiento de Piscinas.

---

## 1. Introducción y Objetivos

Este documento detalla las funcionalidades y especificaciones técnicas del sistema **"Pool-Control Professional"**. El objetivo es crear una plataforma SaaS (Software as a Service) multi-tenant, centralizada y accesible desde cualquier dispositivo, que permita la gestión integral de las operaciones de una empresa de mantenimiento de piscinas.

### Objetivos Clave:

- **Maximizar la Eficiencia Operativa:** Automatizar la planificación de rutas y la generación de partes de trabajo para reducir drásticamente el tiempo de gestión en la oficina y de registro de datos en campo.
- **Incrementar la Rentabilidad:** Controlar de forma exhaustiva el consumo de productos químicos, optimizar la política de precios por cliente y facilitar una facturación precisa.
- **Mejorar la Calidad del Servicio:** Estandarizar los procedimientos de mantenimiento para cada piscina, asegurando el cumplimiento de tareas y garantizando la calidad del agua mediante un sistema de alertas proactivo.
- **Aumentar la Transparencia y Control:** Ofrecer datos claros y precisos a la gerencia para la toma de decisiones estratégicas y, en futuras versiones, ofrecer un portal de cliente para total transparencia.

---

## 2. Arquitectura Tecnológica

- **Frontend:** Aplicación web de una sola página (SPA) desarrollada en **React con Vite y TypeScript** para garantizar un código robusto y escalable. La interfaz de usuario se construirá con la librería de componentes **Mantine UI**, con un diseño 100% responsivo (mobile-first).
- **Backend:** API RESTful construida con **Node.js y Express.js**, utilizando TypeScript. La interacción con la base de datos se gestionará a través de **Prisma ORM** por su seguridad de tipos y eficiencia.
- **Base de Datos:** **PostgreSQL**, elegido por su fiabilidad, escalabilidad y robustez en el manejo de relaciones complejas.
- **Autenticación:** Sistema basado en **Tokens JWT** almacenados en cookies `httpOnly` para una gestión de sesiones segura y moderna.
- **Estructura:** **Monorepo** gestionado con `pnpm` workspaces para un desarrollo cohesivo y centralizado del frontend y el backend.

---

## 3. Definición de Roles y Permisos

| Rol                      | Descripción                                                                         | Permisos Clave                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin**           | Administrador de la plataforma SaaS. Gestiona los tenants.                          | Crear/Editar/Eliminar Tenants. Activar/desactivar suscripciones. Registrar pagos de suscripción.                                       |
| **Administración (Isa)** | Usuario principal del tenant. Configura y gestiona toda la operativa de su empresa. | CRUD completo sobre: Clientes, Piscinas, Catálogo de Tareas y Parámetros, Productos, Precios y Planificación de Rutas.                 |
| **Técnico**              | Usuario de campo. Su interacción es 100% a través del móvil o tablet.               | Ver su ruta asignada del día. Rellenar y guardar partes de trabajo. No puede ver datos de otros técnicos ni información de precios.    |
| **Gerencia (Jorge)**     | Supervisor del negocio. Acceso de solo lectura a toda la información del tenant.    | Ver todos los datos, informes y configuraciones. **NO PUEDE** crear, editar ni eliminar nada, garantizando la integridad de los datos. |

---

## 4. Especificación Funcional por Rol y Pantalla

### 4.1. Rol: Administración (Isa)

- **Pantalla: Dashboard Principal**

  - **Vista:** Al iniciar sesión, Isa ve un resumen del estado del negocio: "Visitas Programadas para Hoy" (con estado: pendiente/completada), "Alertas de Calidad Recientes" (listado de mediciones fuera de rango de las últimas 24h) y accesos directos a las funciones más utilizadas: "Planificar Rutas" y "Gestión de Clientes".
  - **Funciones:** Navegación rápida a las secciones principales del panel de administración.

- **Pantalla: Gestión de Clientes y Piscinas**

  - **Vista:** Un listado maestro de todos los clientes de la empresa. Un buscador potente permite encontrar clientes por nombre, CIF o dirección.
  - **Funciones:**
    - **Crear Cliente:** Un formulario simple para dar de alta un nuevo cliente con sus datos de contacto y facturación, y un campo clave: **Modificador de Precio** (ej. 1.0 por defecto, 0.9 para un 10% de descuento).
    - **Ficha de Cliente:** Al hacer clic en un cliente, se accede a su ficha detallada, donde se listan las piscinas asociadas a él.
    - **Crear/Editar Piscina:** Dentro de la ficha del cliente, Isa puede añadir nuevas piscinas, especificando su dirección, nombre (ej. "Piscina Principal"), volumen en m³, tipo (cloro/sal), etc.
    - Por cada piscina listada, hay dos botones de acción clave: **"Configurar Ficha"** y **"Generar QR"**.

- **Pantalla: Constructor de Fichas de Mantenimiento (El Corazón del Sistema)**

  - **Vista:** Una interfaz de dos columnas. A la izquierda, la "Librería de Parámetros y Tareas" del tenant. A la derecha, la "Ficha de Configuración" de la piscina seleccionada.
  - **Funciones:**
    - **Librería Dinámica:** Isa puede añadir, editar o eliminar plantillas de parámetros (ej. "pH", "Alcalinidad") y tareas (ej. "Limpiar cestos de skimmers", "Comprobar presión del filtro"). Al crear un parámetro, define su tipo de input (Número, Sí/No, Texto, Selección Múltiple).
    - **Configuración por Arrastre:** Isa arrastra ítems de la librería a la ficha de la piscina para construir su plan de mantenimiento personalizado.
    - **Reglas de Negocio:** Para cada ítem añadido a la ficha, Isa define su **frecuencia** (Diaria, Semanal, Mensual...). Para los parámetros numéricos, establece los **rangos Mín/Máx** que activarán una alerta si el técnico introduce un valor fuera de ellos.

- **Pantalla: Planificador de Rutas Semanales**

  - **Vista:** Una cuadrícula visual con los días de la semana en las columnas y los técnicos en las filas. Una barra lateral muestra una lista de "Visitas Pendientes", generadas automáticamente por el sistema según la frecuencia configurada en las fichas de cada piscina.
  - **Funciones:** Isa **arrastra una visita pendiente y la suelta** en la casilla del técnico y día correspondientes. Puede mover las visitas entre técnicos y días para balancear la carga de trabajo. El sistema marca visualmente las rutas sobrecargadas.

- **Pantalla: Gestión de Catálogo y Precios de Productos**
  - **Vista:** Una tabla con todos los productos químicos que usa la empresa (hipoclorito, reductor de pH, etc.).
  - **Funciones:** Permite hacer un CRUD completo sobre los productos, definiendo su nombre, unidad (L, Kg) y su **Precio Base de Venta**. Este precio, combinado con el "Modificador de Precio" del cliente, calculará el precio final en cada consumo.

### 4.2. Rol: Técnico

- **Pantalla: Mi Ruta de Hoy**

  - **Vista:** Al iniciar sesión en su móvil, el técnico ve una lista vertical, simple y clara con las visitas del día, ordenadas por proximidad u horario. Cada tarjeta de visita muestra: Nombre del Cliente, Dirección y un botón grande: **"INICIAR VISITA"**.
  - **Funciones:** Tocar la dirección abre Google Maps/Apple Maps con la ruta trazada. El flujo de trabajo está diseñado para ser lineal y sin distracciones.

- **Pantalla: Parte de Trabajo Dinámico**
  - **Vista:** Al iniciar la visita (opcionalmente escaneando el QR de la piscina), la pantalla se transforma en el parte de trabajo. **Este formulario no es estático**, se genera dinámicamente basándose en la configuración que Isa creó en el "Constructor de Fichas".
    - **Sección "Mediciones":** Controles optimizados para la rapidez. Si el pH tiene un rango de 7.2-7.6, al introducir 7.8, el campo se pondrá en rojo brillante al instante.
    - **Sección "Tareas Programadas":** SOLO si para esa visita toca "Limpiar cestos de skimmers", aparecerá un checkbox para marcarlo como hecho.
    - **Sección "Consumo de Productos":** Una lista de los productos más comunes con botones `+` y `-` para añadir la cantidad usada de forma rápida.
  - **Funciones:** Rellenar los campos. El botón **"GUARDAR Y FINALIZAR"** al final envía toda la información al sistema, la cual es **inmutable** y genera un registro histórico.

### 4.3. Rol: Gerencia (Jorge)

- **Pantalla: Dashboard de Gerencia**

  - **Vista:** Un panel de alto nivel con los KPIs clave para la salud del negocio: Facturación por Consumo de Producto del último mes, Margen de Beneficio por Cliente, Nº de Alertas de Calidad generadas, Ranking de Rendimiento de Técnicos (visitas/día).
  - **Funciones:** Todo es visual, con gráficos interactivos pero sin capacidad de edición. Permite filtrar por rangos de fecha.

- **Navegación en Modo "Solo Lectura"**
  - **Funcionalidad:** Jorge puede acceder a las mismas pantallas que Isa (planificador, fichas de clientes, precios), pero todos los botones de "Crear", "Editar", "Guardar" o "Eliminar" están desactivados o directamente no son visibles. Su rol es de supervisión y análisis estratégico, no de ejecución.

### 4.4. Rol: SuperAdmin

- **Funcionalidad:** El SuperAdmin no interactúa con la operativa de las piscinas, sino con la plataforma en sí. Su panel es mucho más simple y se centra en la gestión de los tenants (las empresas suscritas al servicio). Permite crear nuevas cuentas, definir sus subdominios, y gestionar su estado de suscripción y ciclo de pagos.
