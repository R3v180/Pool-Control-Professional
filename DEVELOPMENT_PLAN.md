# Plan de Desarrollo y Arquitectura: Pool-Control Professional

**Filosofía del Documento:** Este no es solo un plan; es la narrativa arquitectónica y de negocio del proyecto. Sirve como la hoja de ruta para el trabajo futuro y, a la vez, como una crónica de las decisiones tomadas que nos han traído hasta aquí. Es un documento vivo que refleja nuestra ambición y nuestro compromiso con la excelencia.

---

## ✅ FASE 1: La Fundación Operativa Inteligente (v1.0)

- **Estado:** `COMPLETADA Y VALIDADA`
- **Resumen:** Durante esta fase fundacional, hemos construido una plataforma operativa robusta y completa. Se ha digitalizado y optimizado todo el flujo de trabajo, desde la gestión de catálogos y clientes hasta la ejecución de partes de trabajo y un sistema de ticketing avanzado. Esta fase ha culminado con la entrega de dos piezas angulares del sistema:

  1.  **El Centro de Mando Operativo (Planning Hub v1.0):**

      - **Visión Alcanzada:** Hemos trascendido la idea de un simple calendario. Se ha construido un entorno interactivo donde el `ADMIN` no solo planifica, sino que **orquesta y reacciona**.
      - **Capacidades Clave Entregadas:**
        - **Generación Automática de Visitas:** El sistema lee las **Rutas Maestras** y la **Estacionalidad** para generar el plan de trabajo base, eliminando horas de trabajo manual.
        - **Gestión de Excepciones Visual:** El "Muelle de Carga" aísla y presenta de forma clara la "Deuda Operativa" y el "Trabajo Huérfano".
        - **Acciones en Lote:** El `ADMIN` puede seleccionar múltiples visitas y reasignarlas o reprogramarlas en bloque, proporcionando una eficiencia sin precedentes.
        - **Contexto Visual Avanzado:** La interfaz alerta activamente sobre conflictos de horario (asignaciones a técnicos no disponibles) y proporciona información detallada al instante mediante `Tooltips`, reduciendo errores y mejorando la toma de decisiones.

  2.  **El Módulo de Control Financiero (v1.0):**
      - **Visión Alcanzada:** Hemos sentado las bases para que la plataforma no solo gestione operaciones, sino que también controle la salud financiera del negocio.
      - **Capacidades Clave Entregadas:**
        - **Dashboard de Gerencia Interactivo:** Ofrece KPIs dinámicos sobre la rentabilidad, costes y rendimiento del equipo.
        - **Página de Estado de Cuentas:** Proporciona una vista clara de la situación financiera de cada cliente, destacando saldos pendientes. La funcionalidad de "drill-down" permite ver el desglose mensual de la deuda, ofreciendo una trazabilidad completa para la gestión de cobros.

---

## 🚧 FASE 2: La Optimización Proactiva y la Experiencia de Usuario (v2.0)

- **Estado:** `EN PROGRESO`
- **Intención Estratégica:** Evolucionar la plataforma de una herramienta de **gestión eficiente** a un **asistente inteligente y proactivo**. El objetivo es que el sistema no solo presente información, sino que **sugiera, optimice y prevenga problemas**, llevando la productividad del `ADMIN` y la rentabilidad del negocio a un nuevo nivel.

- **Plan de Acción Detallado:**

  1.  **Inteligencia de Planificación:**

      - **Estado:** `PENDIENTE`
      - **Intención Estratégica:** Reducir la carga cognitiva del `ADMIN` y los costes operativos.
      - **Capacidades a Implementar:**
        - **Optimización de Rutas Diarias:** Integración con una API de mapas para añadir un botón "Optimizar Ruta" en el Planning Hub. Con un solo clic, el sistema recalculará el orden de las visitas de un técnico para minimizar el tiempo de conducción y los kilómetros.
        - **Alertas de Sobrecarga:** El sistema alertará visualmente en el Planning Hub si se asignan más horas de trabajo a un técnico de las que tiene su jornada, previniendo el burnout y errores de planificación.

  2.  **Control Total de la Perspectiva y la Densidad:**

      - **Estado:** `PENDIENTE`
      - **Intención Estratégica:** Dar al `ADMIN` un control absoluto sobre la visualización de los datos para que pueda adaptarse a cualquier contexto, desde la urgencia del día a día hasta la estrategia mensual.
      - **Capacidades a Implementar:**
        - **Selector de Escala de Tiempo:** Implementar los controles para cambiar la vista del Planning Hub entre `Día`, `Semana` y `Mes`.
        - **Agrupación Inteligente (Clustering):** En la vista de "Mes", agrupar las visitas de los días con alta densidad en un único bloque expandible ("+15 visitas") para mantener la claridad visual.

  3.  **Contexto de Negocio Integrado:**
      - **Estado:** `PENDIENTE`
      - **Intención Estratégica:** Dotar al `ADMIN` de información financiera y de riesgo directamente en su herramienta de planificación.
      - **Capacidades a Implementar:**
        - **Modo Rentabilidad:** Un interruptor en el Planning Hub que colorea las visitas según la rentabilidad del cliente, ayudando a priorizar tareas.
        - **Iconos de Riesgo:** Indicadores visuales en las visitas para clientes con facturas vencidas o incidencias críticas abiertas.

---

## ▶️ Visión a Largo Plazo: Hacia el ERP Completo

Una vez consolidada la Inteligencia Operativa, el desarrollo continuará con los siguientes grandes módulos que completarán la transición a una solución ERP integral.

- **Gestión de Inventario y Compras:**

  - **Estado:** `PLANIFICADO`
  - **Propósito:** Optimizar la gestión de stock de productos químicos y materiales, definir mínimos/máximos y generar propuestas de compra automáticas.

- **Alertas Proactivas por Umbrales:**

  - **Estado:** `PLANIFICADO`
  - **Propósito:** Implementar un sistema de vigilancia automática que envíe notificaciones si los parámetros del agua medidos por un técnico están fuera de los umbrales de seguridad, permitiendo pasar de la corrección a la prevención.

- **Modo Offline (PWA) para Técnicos:**
  - **Estado:** `PLANIFICADO`
  - **Propósito:** Garantizar la continuidad del negocio en campo. La aplicación del técnico funcionará sin conexión a internet, sincronizando los datos automáticamente al recuperar la señal.
