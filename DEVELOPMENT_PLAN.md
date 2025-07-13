# Plan de Desarrollo y Arquitectura: Pool-Control Professional

**Filosofía del Documento:** Este no es solo un plan, es la narrativa arquitectónica y de negocio del proyecto. Sirve como la hoja de ruta para el trabajo futuro y, a la vez, como una crónica de las decisiones tomadas, garantizando un entendimiento profundo del sistema en cualquier punto de su ciclo de vida.

---

## ✅ FASE 0 a 6: Fundación, Operativa y Rentabilidad

- **Estado:** `COMPLETADA`
- [cite_start]**Resumen:** Durante estas fases iniciales, se estableció una base arquitectónica robusta (Monorepo, TypeScript estricto), se construyó un backend seguro con Prisma y autenticación JWT, y se desarrollaron todos los módulos operativos clave. [cite: 4] [cite_start]Esto incluye la gestión completa de catálogos, la planificación de rutas, la ejecución de partes de trabajo y la supervisión de incidencias. [cite: 5] [cite_start]El sistema alcanzó un estado funcional completo para la digitalización de la operativa diaria. [cite: 6]

---

## ✅ FASE 7: Ticketing Avanzado y Comunicación Proactiva

- **Estado:** `COMPLETADA`
- [cite_start]**Intención Estratégica Cumplida:** Se ha transformado con éxito el sistema de incidencias reactivo en un motor de resolución de problemas colaborativo, auditable y proactivo. [cite: 7, 8] [cite_start]El objetivo de crear un sistema de ticketing completo, que formalice la comunicación y asigne responsabilidades claras, se ha alcanzado plenamente. [cite: 8]
- [cite_start]**Crónica de Implementación:** Se amplió el modelo de datos para soportar un flujo de trabajo granular, incluyendo tareas accionables (`IncidentTask`), evidencia visual (`IncidentImage`) y un registro de auditoría inmutable (`IncidentTaskLog`). [cite: 9, 10, 11, 12] [cite_start]El backend se robusteció para gestionar el ciclo de vida completo del ticket, incluyendo notificaciones automáticas que cierran el bucle de comunicación entre el técnico y el administrador. [cite: 13, 16] Finalmente, se habilitó la campana de notificaciones para los técnicos y se solucionaron todos los bloqueos del frontend, resultando en un flujo de trabajo fluido y validado.

---

## 🚧 FASE 8: El Motor Financiero y la Inteligencia de Negocio

- **Estado:** `EN PROGRESO`
- **Intención Estratégica:** Esta es la fase más ambiciosa hasta la fecha. Su misión es evolucionar la plataforma de una herramienta de gestión operativa a un **socio estratégico para el negocio**, proporcionando una visibilidad financiera completa y herramientas de análisis para maximizar la rentabilidad.

- **Plan de Acción Detallado y Priorizado:**

  1.  **Módulo de Informes de Consumo y Rentabilidad v1:**

      - **Estado:** `COMPLETADO`
      - **Valor Aportado:** Se ha sentado la base de la inteligencia de negocio. Esta primera versión del módulo permite a los administradores y gerentes responder a una pregunta fundamental: **"¿cuánto nos cuesta realmente cada cliente?"**.
      - **Capacidades Implementadas:**
        - [cite_start]**API de Reportes Robusta:** Se construyó un backend capaz de procesar y agregar datos de consumo, aplicando los costes reales de los productos para calcular la rentabilidad interna. [cite: 26]
        - **Interfaz Interactiva con Desglose (Drill-Down):** Se desarrolló una nueva página que no solo muestra totales, sino que permite una auditoría completa. Un usuario puede empezar en un coste total por cliente, hacer clic para ver el desglose de productos que componen ese coste, y volver a hacer clic en un producto para ver la lista de visitas exactas donde se utilizó, con un enlace directo al parte de trabajo original.
        - [cite_start]**Filtros Flexibles y Exportación:** Se dotó a la interfaz de filtros intuitivos por cliente y fecha, y la capacidad de exportar los resultados a CSV, integrando la plataforma con los flujos de trabajo de facturación externos. [cite: 26, 126]

  2.  **Evolución del Motor Financiero (Facturación y Precios Avanzados):**

      - **Estado:** `PLANIFICADO (Prioridad Alta)`
      - **Intención Estratégica:** Atender la compleja realidad comercial de las empresas de mantenimiento, donde cada cliente es un mundo. El sistema debe ser capaz de manejar múltiples modelos de facturación.
      - **Capacidades a Implementar:**
        - **Diferenciación Coste vs. Precio de Venta (PVP):** Se añadirán los campos `salePrice` y `taxRate` (IVA) a los productos para poder generar informes "para facturar" y no solo de coste interno.
        - **Modelos de Contrato por Cliente:** Se podrá configurar para cada cliente su modelo de facturación (`Todo Incluido`, `Cuota + Materiales`, `Solo Servicio`) y su cuota fija mensual.
        - **Reglas de Precios Granulares:** Se implementará un sistema para definir descuentos por cliente, aplicables tanto a productos individuales como a "familias" o categorías completas de productos (ej. "100% de descuento en toda la familia de 'Cloros'").
        - **Registro de Gastos Externos:** Se permitirá añadir gastos manuales (combustible, salarios, etc.) para obtener una visión de la rentabilidad global del negocio mucho más precisa en el Dashboard de Gerencia.

  3.  **Dashboard de Gerencia y Rol "Camaleón":**

      - **Estado:** `PLANIFICADO (Prioridad Alta)`
      - [cite_start]**Intención Estratégica:** Crear el centro de mando definitivo para el rol `MANAGER`, enfocado en la supervisión estratégica y la flexibilidad operativa. [cite: 29]
      - **Capacidades a Implementar:**
        - [cite_start]**Dashboard de KPIs:** Un panel con gráficos visuales sobre la rentabilidad, eficiencia del equipo y estado de las incidencias (ej. tiempo medio de resolución). [cite: 98, 29]
        - **Selector de Vista:** Se implementará la innovadora funcionalidad del "rol camaleón", que permitirá al gerente, desde un simple control en la interfaz, cambiar su vista para actuar con todos los permisos de un `ADMIN` o un `TECHNICIAN`, garantizando la cobertura en emergencias pero manteniendo la integridad de los datos gracias a una auditoría estricta de todas sus acciones.

  4.  **Alertas Proactivas por Umbrales:**

      - **Estado:** `PLANIFICADO`
      - **Intención Estratégica:** Pasar de la corrección a la prevención. El sistema debe avisar de los problemas antes de que el cliente los note.
      - **Capacidades a Implementar:**
        - **Fase 1 (Backend):** Implementar la lógica para que el sistema genere notificaciones automáticas cuando un valor de parámetro medido por un técnico esté fuera de los rangos de seguridad configurados para esa piscina.
        - **Fase 2 (Configuración):** Crear una interfaz para que los usuarios (Admin/Manager) puedan decidir qué tipo de alertas proactivas desean recibir.

  5.  **Modo Offline (PWA) para Técnicos:**
      - **Estado:** `PLANIFICADO`
      - [cite_start]**Intención Estratégica:** Garantizar la continuidad del negocio en cualquier circunstancia, eliminando la dependencia de una conexión a internet en campo. [cite: 27]
      - [cite_start]**Tareas Técnicas:** Implementar Service Workers e IndexedDB. [cite: 28]
