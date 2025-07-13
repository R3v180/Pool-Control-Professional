# Plan de Desarrollo y Arquitectura: Pool-Control Professional

**Filosofía del Documento:** Este no es solo un plan, es la narrativa arquitectónica y de negocio del proyecto. Sirve como la hoja de ruta para el trabajo futuro y, a la vez, como una crónica de las decisiones tomadas, garantizando un entendimiento profundo del sistema en cualquier punto de su ciclo de vida.

---

## ✅ FASE 0 a 6: Fundación, Operativa y Rentabilidad

- **Estado:** `COMPLETADA`
- [cite_start]**Resumen:** Durante estas fases iniciales, se estableció una base arquitectónica robusta (Monorepo, TypeScript estricto), se construyó un backend seguro con Prisma y autenticación JWT, y se desarrollaron todos los módulos operativos clave. [cite: 4] [cite_start]Esto incluye la gestión completa de catálogos (parámetros, tareas, productos), la planificación de rutas, la ejecución de partes de trabajo y la supervisión de incidencias y consumo de materiales. [cite: 5] [cite_start]El sistema alcanzó un estado funcional completo para la digitalización de la operativa diaria. [cite: 6]

---

## ✅ FASE 7: Ticketing Avanzado y Comunicación Proactiva

- **Estado:** `COMPLETADA`
- **Resumen:** Esta fase ha transformado con éxito el sistema de incidencias en un motor de resolución de problemas colaborativo y completamente trazable. [cite_start]Se implementó un sistema de ticketing completo que formaliza la comunicación entre administradores y técnicos. [cite: 8] [cite_start]Se habilitaron las notificaciones bidireccionales, permitiendo que los técnicos sean notificados de cualquier cambio en sus tareas asignadas. [cite: 58, 1090] [cite_start]Se solucionó el bloqueo crítico del frontend, garantizando un flujo de trabajo fluido y sin impedimentos. [cite: 23, 63]

---

## 🚧 FASE 8 y Visión de Futuro: Inteligencia de Negocio y Eficiencia Avanzada

- **Estado:** `EN PROGRESO`
- **Intención Estratégica:** Una vez consolidada la operativa, esta fase se centra en expandir las capacidades de la plataforma hacia el análisis de negocio, la automatización proactiva y la mejora de la eficiencia global.

- **Plan de Acción Detallado:**

  1.  **Módulo de Informes de Consumo y Rentabilidad:**

      - **Estado:** `COMPLETADO`
      - [cite_start]**Descripción:** Se ha desarrollado un completo módulo de informes que permite a los roles `ADMIN` y `MANAGER` analizar la rentabilidad por cliente y periodo. [cite: 25, 26] La funcionalidad incluye:
        - **API de Agregación:** Un backend robusto que calcula los costes totales basándose en los consumos registrados.
        - **Interfaz Interactiva:** Una página de informes con filtros por cliente y fecha.
        - **Funcionalidad de Desglose (Drill-Down):** Los usuarios pueden expandir los resultados para ver el detalle de productos consumidos y, desde ahí, navegar hasta el parte de trabajo original donde se registró el consumo.
        - [cite_start]**Exportación de Datos:** Capacidad para exportar los informes generados a formato CSV para su uso en facturación o análisis externo. [cite: 126]

  2.  **Dashboard de Gerencia y Rol "Camaleón":**

      - **Estado:** `PLANIFICADO`
      - [cite_start]**Propósito de Negocio:** Proporcionar al rol `MANAGER` un centro de mando estratégico con KPIs y gráficos para el análisis del negocio. [cite: 29]
      - **Evolución del Diseño:** Basado en las necesidades del negocio, este rol se implementará con un **"Selector de Vista"**. Esto permitirá al gerente operar con tres perfiles distintos desde su misma cuenta:
        - [cite_start]**Vista de Gerencia (por defecto):** El dashboard con KPIs de alto nivel (rentabilidad, eficiencia, estado de incidencias). [cite: 98]
        - **Vista de Administración:** Acceso completo a las funcionalidades del rol `ADMIN` para poder cubrir ausencias o realizar tareas operativas.
        - **Vista de Técnico:** Capacidad para visualizar la ruta y rellenar partes de trabajo, ideal para gerentes que también realizan trabajo de campo.
      - [cite_start]**Tareas Técnicas:** Crear los nuevos endpoints de agregación para los KPIs, diseñar los componentes de visualización de datos e implementar la arquitectura de "vistas conmutables" en el frontend. [cite: 30]

  3.  **Alertas Proactivas por Umbrales de Parámetros:**

      - **Estado:** `PLANIFICADO`
      - **Propósito de Negocio:** Transformar el sistema de un modo reactivo a uno proactivo, notificando automáticamente al personal de oficina cuando un parámetro medido en campo está fuera de su rango de seguridad.
      - **Tareas Técnicas:**
        - **Fase 1 (Backend):** Modificar el servicio de envío de partes de trabajo (`visits.service.ts`) para que compare los valores numéricos con los umbrales de la `PoolConfiguration` y genere una `Notification` automática si se excede el rango.
        - **Fase 2 (Configuración):** Desarrollar una nueva sección en la interfaz que permita a cada usuario (Admin/Manager) configurar qué tipo de alertas desea recibir.

  4.  **Modo Offline (PWA) para Técnicos:**
      - **Estado:** `PLANIFICADO`
      - [cite_start]**Propósito de Negocio:** Garantizar la operatividad del técnico en zonas de baja o nula conectividad, como garajes o sótanos. [cite: 27]
      - [cite_start]**Tareas Técnicas:** Implementar `Service Workers` e `IndexedDB` para el funcionamiento sin conexión y la sincronización de datos. [cite: 28]
