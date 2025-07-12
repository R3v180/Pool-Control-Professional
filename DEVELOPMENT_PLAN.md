# Plan de Desarrollo y Arquitectura: Pool-Control Professional

**Filosofía del Documento:** Este no es solo un plan, es la narrativa arquitectónica y de negocio del proyecto. Sirve como la hoja de ruta para el trabajo futuro y, a la vez, como una crónica de las decisiones tomadas, garantizando un entendimiento profundo del sistema en cualquier punto de su ciclo de vida.

---

## ✅ FASE 0 a 6: Fundación, Operativa y Rentabilidad

- **Estado:** `COMPLETADAS`
- **Resumen:** Durante estas fases iniciales, se estableció una base arquitectónica robusta (Monorepo, TypeScript estricto), se construyó un backend seguro con Prisma y autenticación JWT, y se desarrollaron todos los módulos operativos clave. Esto incluye la gestión completa de catálogos (parámetros, tareas, productos), la planificación de rutas, la ejecución de partes de trabajo y la supervisión de incidencias y consumo de materiales. El sistema alcanzó un estado funcional completo para la digitalización de la operativa diaria.

---

## 🚧 FASE 7: Ticketing Avanzado y Comunicación Proactiva

- **Estado:** `EN PROGRESO`
- **Intención Estratégica:** Transformar el sistema de incidencias reactivo en un motor de resolución de problemas proactivo y colaborativo. El objetivo es crear un sistema de ticketing completo que formalice la comunicación, asigne responsabilidades claras y proporcione una trazabilidad total de cada acción.
- **Plan de Acción y Hitos de Implementación:**

  1.  **Ampliación del Modelo de Datos para Ticketing:**

      - **Estado:** `COMPLETADO`
      - **Descripción:** Se ha modificado el `schema.prisma` para dar soporte a un flujo de trabajo granular.
        - Se añadió el modelo `IncidentTask` para representar tareas accionables con `status`, `priority` y `deadline`.
        - Se añadió el modelo `IncidentImage` para permitir la adjunción de evidencia visual a las incidencias, un requisito clave para el diagnóstico remoto.
        - Se añadió el modelo `IncidentTaskLog` para crear una pista de auditoría inmutable de cada cambio y comentario en una tarea.

  2.  **Desarrollo del Backend para el Ciclo de Vida del Ticket:**

      - **Estado:** `COMPLETADO`
      - **Descripción:** Se ha construido toda la infraestructura de API necesaria para la nueva funcionalidad.
        - **API de Subida Segura:** Se implementó un endpoint (`/api/uploads/signature`) que se integra con Cloudinary para permitir la subida de imágenes desde el cliente de forma segura.
        - **API de Tareas:** Se crearon los endpoints CRUD para `/api/incident-tasks`.
        - **API de Comunicación:** Se implementaron endpoints específicos como `/api/incident-tasks/:id/status` y `/api/incident-tasks/:id/log` que, además de realizar la acción, crean notificaciones automáticas para el `ADMIN`, cerrando el bucle de comunicación.
        - **API de Consulta:** Se desarrolló el endpoint `/api/incident-tasks/my-tasks` para que cada usuario pueda consultar únicamente las tareas que tiene asignadas.

  3.  **Integración en la Interfaz del Técnico (Flujo de Entrada):**

      - **Estado:** `COMPLETADO`
      - **Descripción:** Se ha modificado el flujo de trabajo del técnico para incorporar las nuevas capacidades.
        - En `WorkOrderPage.tsx`, el técnico ahora puede adjuntar imágenes a una incidencia.
        - En `MyRoutePage.tsx`, el técnico ahora ve una nueva sección con las "Tareas Especiales" que se le han asignado.

  4.  **Desarrollo de la Interfaz de Gestión (Admin y Técnico):**
      - **Estado:** `EN PROGRESO - BLOQUEADO`
      - **Descripción:** Se ha desarrollado la página `IncidentDetailPage.tsx`, que actúa como centro de mando. La página ya incluye renderizado condicional por rol, mostrando una vista de gestión para el `ADMIN` y una vista de ejecución para el `TÉCNICO`.
      - **Bloqueo Actual:** La funcionalidad está mayormente implementada, pero un `TypeError` persistente en el componente `DateTimePicker` de la vista del técnico impide que este pueda interactuar plenamente con la tarea (solicitar aplazamientos), lo que bloquea la validación del flujo completo.

---

## ▶️ FASE 8 y Visión de Futuro

- **Estado:** `PLANIFICADO`
- **Intención Estratégica:** Una vez desbloqueado y finalizado el sistema de ticketing, se expandirán las capacidades de la plataforma hacia el análisis de negocio y la mejora de la eficiencia operativa.
- **Plan de Acción Detallado:**
  1.  **Módulo de Informes de Consumo:**
      - **Propósito de Negocio:** Permitir al `ADMIN` y al `MANAGER` analizar la rentabilidad por cliente y periodo, y exportar los datos para su facturación.
      - **Tareas Técnicas:** Crear la API de reportes con agregaciones y la página de visualización en el frontend.
  2.  **Modo Offline (PWA) para Técnicos:**
      - **Propósito de Negocio:** Garantizar la operatividad del técnico en zonas de baja o nula conectividad.
      - **Tareas Técnicas:** Implementar `Service Workers` e `IndexedDB` para el funcionamiento sin conexión.
  3.  **Dashboard de Gerencia (`MANAGER`):**
      - **Propósito de Negocio:** Proporcionar al rol `MANAGER` KPIs y gráficos de alto nivel para el análisis estratégico del negocio, incluyendo métricas del nuevo sistema de ticketing (ej. tiempo medio de resolución).
      - **Tareas Técnicas:** Crear endpoints de agregación en el backend y desarrollar componentes de visualización de datos.
