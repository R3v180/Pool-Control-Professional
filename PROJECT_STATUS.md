# Estado del Proyecto y Crónica de Desarrollo: Pool-Control Professional

**Filosofía de este documento:** Este no es solo un registro de tareas, es el pulso del proyecto. Refleja nuestro compromiso con la excelencia, documentando no solo _qué_ hemos hecho, sino _por qué_ lo hemos hecho y el _valor_ que cada fase aporta al producto final. Está diseñado para ser la fuente de verdad para cualquier miembro del equipo, presente o futuro.

_Última actualización: 13 de julio de 2025, 06:30 CEST_

---

## 1. Visión Estratégica Actual: Sprint Final hacia la Versión 1.0

El proyecto entra en su fase final de desarrollo para la Versión 1.0. El objetivo es consolidar una aplicación funcional, robusta y con funcionalidades diferenciales clave. Durante los próximos 3 días, el enfoque será total en la implementación de las herramientas de gestión financiera, análisis y supervisión proactiva que definirán el producto para su presentación.

---

## 2. Hitos de Desarrollo Validados

### ✅ **Módulo de Informes de Consumo y Rentabilidad v1**

- **Estado:** `COMPLETADO Y VALIDADO`
- **Resumen:** Se ha implementado con éxito la primera versión del módulo de informes. Esta base nos proporciona una visión de la **rentabilidad interna** (basada en el coste de los productos) y una potente funcionalidad de **desglose interactivo (drill-down)** que permite auditar cualquier coste hasta el parte de trabajo original. La infraestructura técnica (API, componentes de UI, exportación a CSV) está lista para evolucionar.

### ✅ **Flujo de Trabajo Avanzado para Incidencias (Ticketing)**

- **Estado:** `COMPLETADO Y VALIDADO`
- **Resumen:** Se ha finalizado la implementación del sistema de ticketing avanzado, creando un flujo de comunicación bidireccional y completamente trazable entre administradores y técnicos. La comunicación y la resolución de problemas ahora son eficientes y auditables.

---

## 3. Plan de Acción y Tareas Pendientes

### **Plan de Ataque para la Versión 1.0 (Próximos 3 Días)**

Esta es la máxima prioridad actual. El plan se ha detallado para maximizar el valor entregado en el sprint final.

#### **Mejoras de Usabilidad y UI (Tareas Rápidas)**

- **Estado:** `PENDIENTE`
- **Objetivo:** Implementar pequeñas mejoras de alto impacto en la interfaz actual para aumentar la eficiencia del `ADMIN`.
- **Tareas Técnicas:**
  - **Navegación desde el Dashboard:** Hacer que las tarjetas de "Visitas de Hoy" en el `AdminDashboard` sean clicables, permitiendo al administrador navegar directamente al detalle del parte de trabajo (`WorkOrderPage`) con un solo clic, de la misma forma que ya funciona con las incidencias.
  - **Mejora Visual de Alertas:** Recuperar y estandarizar el indicador visual para las incidencias críticas. Además del fondo tenue, se añadirá un **borde izquierdo rojo intenso** a las incidencias vencidas o críticas en el `AdminDashboard`, replicando el estilo del `PlannerPage` para una coherencia visual y una identificación más rápida de los problemas urgentes.

#### **DÍA 1: La Gran Refundación (Cimientos del Backend)**

- **Estado:** `PENDIENTE`
- **Objetivo:** Modificar el `schema.prisma` para dar soporte a TODAS las nuevas funcionalidades de la v1.0. Es el paso más crítico y bloqueante.
- **Tareas Técnicas:**
  - **Motor Financiero:** Añadir campos `salePrice` (PVP), `taxRate` (IVA), `monthlyFee` (Cuota Fija) y `billingModel` (Modelo de Contrato).
  - **Precios Avanzados:** Crear los nuevos modelos `ProductCategory` (para familias de productos) y `ClientProductPricing` (para reglas de descuento).
  - **Historial de Pagos:** Crear el nuevo modelo `Payment` para registrar los pagos de los clientes.
  - **Gastos Adicionales:** Crear el nuevo modelo `Expense` para el registro de gastos manuales.
  - **Actualizar Seed:** Modificar el script de `seed.ts` para generar datos de prueba realistas para toda esta nueva estructura.

#### **DÍA 2: Construcción de APIs y Lógica de Negocio (Backend)**

- **Estado:** `PENDIENTE`
- **Objetivo:** Desarrollar todos los endpoints de la API necesarios.
- **Tareas Técnicas:**
  - **API Financiera:** Crear los endpoints para gestionar las reglas de precios, gastos y pagos.
  - **API de Alertas:** Implementar la lógica en `visits.service.ts` para comprobar umbrales de parámetros y crear las notificaciones de alerta.
  - **API de Dashboard:** Crear los endpoints de agregación de datos para los KPIs del Dashboard de Gerencia.
  - **Evolución de Informes:** Actualizar el `reports.service.ts` para generar el "Informe para Facturación".

#### **DÍA 3: Maratón de Frontend e Integración Final**

- **Estado:** `PENDIENTE`
- **Objetivo:** Construir todas las interfaces de usuario necesarias.
- **Tareas Técnicas:**
  - **Ficha de Cliente:** Añadir la sección de "Configuración de Facturación".
  - **Página de Informes:** Implementar el selector de modo ("Rentabilidad" vs "Facturación").
  - **Historial de Pagos:** Añadir la pestaña y formulario de pagos en la ficha del cliente.
  - **Dashboard de Gerencia:** Construir la primera versión del `ManagerDashboard.tsx` con los KPIs principales y el "Selector de Vista".

### **Tareas de Refinamiento (Post-v1.0)**

Estas son las tareas que teníamos pendientes del hito anterior. Se abordarán después del sprint de la v1.0 para pulir la aplicación.

- **Refinamiento de UI del Módulo de Incidencias:** Realizar una pasada de pulido visual sobre la interfaz de `IncidentDetailPage`.
- **Mejora a Notificaciones en Tiempo Real:** Implementar WebSockets para que la campana de notificaciones se actualice de forma instantánea.

---

## 4. Bloqueos Actuales

- **ESTADO:** `SIN BLOQUEOS`
- **Descripción:** El bloqueo crítico de frontend que afectaba al módulo de incidencias ha sido **resuelto**. No existen impedimentos técnicos para comenzar la implementación del plan.
