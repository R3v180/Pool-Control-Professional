# Plan de Desarrollo y Arquitectura: Pool-Control Professional

**Filosofía del Documento:** Este no es solo un plan, es la narrativa arquitectónica y de negocio del proyecto. Sirve como la hoja de ruta para el trabajo futuro y, a la vez, como una crónica de las decisiones tomadas, garantizando un entendimiento profundo del sistema en cualquier punto de su ciclo de vida.

---

## ✅ FASE 0 a 7: Fundación y Operativa Inteligente

- **Estado:** `COMPLETADA`
- **Resumen:** Durante estas fases, se ha construido una plataforma operativa robusta y completa. Se ha digitalizado todo el flujo de trabajo, desde la configuración de catálogos y fichas de mantenimiento, hasta la planificación de rutas y la ejecución de partes de trabajo. Culmina con la implementación de un **sistema de ticketing avanzado** que asegura una comunicación y resolución de incidencias eficiente y completamente trazable.

---

## 🚧 FASE 8 y Sprint Final v1.0: El Motor Financiero y la Inteligencia de Negocio

- **Estado:** `EN PROGRESO`
- **Intención Estratégica:** Esta es la fase crucial que eleva la plataforma de una herramienta operativa a un **socio estratégico para el negocio**. El objetivo es implementar un conjunto de funcionalidades de alto valor para la presentación de la v1.0 en los próximos 3 días, centrándonos en la gestión financiera, el análisis de datos y la supervisión proactiva.

- **Plan de Acción Detallado y Priorizado para la v1.0:**

  1.  **Módulo de Informes de Consumo y Rentabilidad v1:**

      - **Estado:** `COMPLETADO`
      - **Valor Aportado:** Se ha construido la base de la inteligencia de negocio, permitiendo a los administradores analizar la **rentabilidad interna** basada en el coste de los productos. La implementación incluye una API de agregación, una interfaz interactiva con filtros y una potente funcionalidad de **desglose (drill-down)** que permite auditar un coste hasta el parte de trabajo original.

  2.  **Evolución a "Motor Financiero" (Facturación y Precios Avanzados):**

      - **Estado:** `EN PROGRESO (Prioridad Máxima)`
      - **Intención Estratégica:** Dotar al sistema de la flexibilidad necesaria para manejar los modelos de negocio y las estructuras de precios del mundo real, permitiendo generar informes listos para la facturación.
      - **Capacidades a Implementar:**
        - **Diferenciación Coste vs. Precio de Venta:** Se añadirá `salePrice` (PVP) y `taxRate` (IVA) a los productos.
        - **Modelos de Contrato por Cliente:** Se podrá configurar para cada cliente su `billingModel` (`Todo Incluido`, `Cuota + Materiales`, etc.) y su `monthlyFee` (cuota fija).
        - **Reglas de Precios Granulares:** Se implementará un sistema para definir descuentos por cliente, aplicables a productos individuales o a familias de productos completas.
        - **Historial de Pagos y Saldos:** Se creará la funcionalidad para registrar los pagos de los clientes y tener una visión clara de los saldos pendientes.
        - **Registro de Gastos Adicionales:** Se permitirá añadir gastos manuales para obtener una visión de la rentabilidad global mucho más precisa.

  3.  **Dashboard de Gerencia y Rol "Camaleón":**

      - **Estado:** `EN PROGRESO (Prioridad Máxima)`
      - **Intención Estratégica:** Crear el centro de mando definitivo para el rol `MANAGER`, enfocado en la supervisión estratégica y la flexibilidad operativa.
      - **Capacidades a Implementar:**
        - **Dashboard de KPIs:** Un panel con gráficos visuales sobre la rentabilidad, eficiencia del equipo y estado de las incidencias (ej. tiempo medio de resolución).
        - **Selector de Vista:** Se implementará la funcionalidad del "rol camaleón", que permitirá al gerente cambiar su vista para actuar con todos los permisos de un `ADMIN` o un `TECHNICIAN`, garantizando la cobertura operativa con una auditoría completa de sus acciones.

  4.  **Alertas Proactivas por Umbrales:**
      - **Estado:** `EN PROGRESO (Prioridad Máxima)`
      - **Intención Estratégica:** Implementar un sistema de vigilancia automática para pasar de la corrección a la prevención de problemas.
      - **Capacidades a Implementar:** Se implementará la lógica en el backend para que el sistema genere notificaciones automáticas cuando un valor de parámetro medido por un técnico esté fuera de los rangos de seguridad configurados.

---

## ▶️ Visión Post-v1.0: Hacia el ERP Completo

Una vez presentada y validada la v1.0, el desarrollo continuará con los siguientes grandes módulos:

- **Módulo de Gestión de Inventario:**

  - **Estado:** `PLANIFICADO`
  - **Propósito:** Optimizar la gestión de stock y las compras. Incluirá control de niveles de stock, definición de mínimos y máximos por producto y generación de informes de necesidades o propuestas de compra.

- **Modo Offline (PWA) para Técnicos:**

  - **Estado:** `PLANIFICADO`
  - **Propósito:** Garantizar la continuidad del negocio en campo, permitiendo a los técnicos trabajar sin conexión a internet.

- **Módulo de Facturación y Contabilidad Completo:**
  - **Estado:** `PLANIFICADO (Largo Plazo)`
  - **Propósito:** Convertir la plataforma en una solución todo en uno.
  - **Capacidades Futuras:** Generación de facturas con validez legal, gestión de impuestos, presupuestos, pedidos a proveedores y, eventualmente, adaptación a las normativas contables de diferentes países.
