// ====== [1] DEVELOPMENT_PLAN.md ======

# Plan de Desarrollo y Arquitectura: Pool-Control Professional

**Filosofía del Documento:** Este no es solo un plan, es la narrativa arquitectónica y de negocio del proyecto. Sirve como la hoja de ruta para el trabajo futuro y, a la vez, como una crónica de las decisiones tomadas.

---

## ✅ FASE 0 a 8: Fundación, Operativa Inteligente y Business Intelligence

- **Estado:** `COMPLETADA`
- **Resumen:** Durante estas fases, se ha construido una plataforma operativa robusta y completa. Se ha digitalizado el flujo de trabajo, desde la gestión de catálogos y clientes hasta la ejecución de partes de trabajo y un sistema de ticketing avanzado. La Fase 8 culminó con la implementación de un **Dashboard de Gerencia Interactivo**, que proporciona KPIs dinámicos y navegables para un análisis de negocio en tiempo real.

---

## 🚧 FASE 9: El Motor de Planificación Avanzada (v2.0)

- **Estado:** `EN PROGRESO`
- **Intención Estratégica:** Transformar la planificación de una tarea manual y diaria a un **proceso de diseño estratégico y semi-automatizado**. El objetivo es reducir drásticamente el tiempo de gestión del `ADMIN`, optimizar las rutas de los técnicos y hacer el sistema escalable para manejar un gran volumen de clientes.

- **Plan de Acción Detallado para la v2.0:**

  1.  **Diseño de la Arquitectura de Datos:**

      - **Estado:** `COMPLETADO`
      - **Valor Aportado:** Se ha rediseñado el `schema.prisma` para introducir los conceptos de **Zonas Geográficas** y **Rutas Maestras**. Esta nueva estructura permite una organización del trabajo mucho más lógica e intuitiva.

  2.  **Módulo de Gestión de Zonas y Rutas:**

      - **Estado:** `PENDIENTE`
      - **Intención Estratégica:** Dotar al `ADMIN` de las herramientas para diseñar la operativa de la empresa.
      - **Capacidades a Implementar:**
        - **Gestión de Zonas:** Una interfaz para crear, editar y eliminar las áreas de trabajo geográficas.
        - **Diseño de Rutas Maestras:** Una interfaz para crear rutas (ej. "Lunes-Arenal"), asignarlas a un técnico habitual y a una o más zonas.
        - **Gestión de Estacionalidad:** Permitir definir diferentes frecuencias de visita para una misma ruta según el periodo del año (ej. más visitas en verano).

  3.  **Automatización y Planificador Inteligente:**

      - **Estado:** `PENDIENTE`
      - **Intención Estratégica:** Automatizar la generación del plan de trabajo semanal y dar al `ADMIN` las herramientas para gestionar las excepciones de forma eficiente.
      - **Capacidades a Implementar:**
        - **Generador Automático de Visitas:** Un proceso en el backend que leerá las Rutas Maestras y creará el calendario de visitas de forma automática.
        - **Gestión de "Deuda Operativa":** El `PlannerPage` mostrará de forma destacada las visitas de días anteriores no completadas, obligando a su reprogramación.
        - **Gestión de Bajas:** El `ADMIN` podrá marcar a un técnico como no disponible, moviendo sus visitas a una "bolsa de trabajo" para ser reasignadas fácilmente.

  4.  **Gestión de Tareas no Planificadas:**
      - **Estado:** `PENDIENTE`
      - **Intención Estratégica:** Integrar las urgencias y tareas únicas en el flujo de planificación.
      - **Capacidades a Implementar:** Un sistema de **"Órdenes de Trabajo Especiales"** que pueden ser creadas y asignadas sobre la marcha en el `PlannerPage`.

---

## ▶️ Visión Post-v2.0: Hacia el ERP Completo

Una vez consolidado el motor de planificación, el desarrollo continuará con los siguientes grandes módulos.

- **Módulo de Estado de Cuentas y Cobros:**

  - **Estado:** `PLANIFICADO`
  - **Propósito:** Ofrecer una visión clara mes a mes del estado de facturación de cada cliente (Pagado, Pendiente, Atrasado) y facilitar la gestión de cobros.

- **Alertas Proactivas por Umbrales:**

  - **Estado:** `PLANIFICADO`
  - **Propósito:** Implementar un sistema de vigilancia automática para pasar de la corrección a la prevención de problemas.

- **Gestión de Inventario y Compras:**

  - **Estado:** `PLANIFICADO`
  - **Propósito:** Optimizar la gestión de stock, definir mínimos/máximos y generar propuestas de compra.

- **Modo Offline (PWA) para Técnicos:**
  - **Estado:** `PLANIFICADO`
  - **Propósito:** Garantizar la continuidad del negocio en campo.
