# Estado del Proyecto y Crónica de Desarrollo: Pool-Control Professional

**Filosofía de este documento:** Este no es solo un registro de tareas, es el pulso del proyecto. Refleja nuestro compromiso con la excelencia, documentando no solo _qué_ hemos hecho, sino _por qué_ lo hemos hecho y el _valor_ que cada fase aporta al producto final. Está diseñado para ser la fuente de verdad para cualquier miembro del equipo, presente o futuro.

_Última actualización: 13 de julio de 2025, 05:30 CEST_

---

## 1. Visión Estratégica Actual: Hacia el "Motor Financiero"

Tras completar con éxito los módulos operativos y de ticketing, el enfoque estratégico del proyecto se centra en la **Fase 8: La construcción del Motor Financiero**. El objetivo es dotar a la plataforma de una inteligencia de negocio sin precedentes en el sector, permitiendo una gestión financiera y de rentabilidad granular, flexible y adaptada a los múltiples modelos de negocio de las empresas de mantenimiento.

---

## 2. Hitos de Desarrollo Validados

### ✅ **Hito Completado: Módulo de Informes de Consumo v1**

- **Estado:** `COMPLETADO Y VALIDADO`
- **Resumen:** Se ha implementado con éxito la primera versión del módulo de informes. Esta base nos proporciona una visión de la **rentabilidad interna** (basada en el coste de los productos) y la infraestructura técnica (API, componentes de UI, exportación a CSV) sobre la que construiremos el motor financiero completo.

### ✅ **Hito Previo: Flujo de Trabajo Avanzado para Incidencias (Ticketing)**

- **Estado:** `COMPLETADO Y VALIDADO`
- **Resumen:** Se finalizó la implementación del sistema de ticketing avanzado, creando un flujo de comunicación bidireccional y completamente trazable entre administradores y técnicos.

---

## 3. Tareas Inmediatas / Plan de Acción (Próximos 3 Días)

El objetivo es implementar las funcionalidades clave del "Motor Financiero". Se ha dividido el trabajo en pasos lógicos y priorizados para maximizar la eficiencia.

### **PASO 1 (Prioridad Máxima): Evolucionar la Base de Datos**

- **Estado:** `PENDIENTE`
- **Objetivo:** Modificar el `schema.prisma` para dar soporte a la nueva lógica financiera. Es el cimiento indispensable para todo lo demás.
- **Tareas Técnicas:**
  - **En el modelo `Product`:** Añadir los campos `salePrice` (PVP) y `taxRate` (IVA %).
  - **En el modelo `Client`:** Añadir los campos `monthlyFee` (Cuota Fija Mensual) y `billingModel` (un `Enum` con los modelos: `FEE_PLUS_MATERIALS`, `ALL_INCLUSIVE`, `SERVICE_ONLY`).
  - **Crear nuevos modelos:**
    - `ProductCategory`: Para agrupar productos por familias (ej. "Cloros").
    - `ClientProductPricing`: Para definir reglas de descuento específicas por cliente, ya sea a un producto individual o a una familia de productos completa.
    - `Expense`: Para registrar gastos manuales (combustible, salarios, etc.) que afectan a la rentabilidad global.

### **PASO 2: Adaptar el Backend para la Nueva Lógica**

- **Estado:** `PENDIENTE`
- **Objetivo:** Actualizar la API y los servicios para que puedan gestionar y utilizar la nueva estructura de datos.
- **Tareas Técnicas:**
  - Crear los endpoints CRUD para gestionar las `ProductCategory`.
  - Crear los endpoints para que el `ADMIN` pueda definir las reglas de `ClientProductPricing` desde la ficha de un cliente.
  - Modificar el servicio de informes (`reports.service.ts`) para que pueda generar un nuevo **"Informe para Facturación"**, que utilizará `salePrice`, `monthlyFee` y las reglas de descuento, en lugar del `cost` interno.

### **PASO 3: Implementar la Configuración en el Frontend**

- **Estado:** `PENDIENTE`
- **Objetivo:** Crear las interfaces necesarias para que el administrador configure la parte financiera de cada cliente.
- **Tareas Técnicas:**
  - En la página de detalle del cliente (`ClientDetailPage`), añadir un nuevo panel de "Configuración de Facturación".
  - En este panel, el `ADMIN` podrá seleccionar el `billingModel`, establecer la `monthlyFee` y gestionar la tabla de reglas de descuento para ese cliente.

### **PASO 4: Actualizar la Interfaz de Informes**

- **Estado:** `PENDIENTE`
- **Objetivo:** Darle al usuario la capacidad de generar tanto el informe de rentabilidad interna como el nuevo informe para facturación.
- **Tareas Técnicas:**
  - Añadir un selector o un botón en la `ConsumptionReportPage` para elegir el tipo de informe a generar.
  - Ajustar la tabla de resultados y el desglose para mostrar los datos de facturación (precios con IVA, descuentos aplicados, etc.) cuando se seleccione ese modo.

---

## 4. Bloqueos Actuales

- **ESTADO:** `SIN BLOQUEOS`
- **Descripción:** No existen impedimentos técnicos para comenzar la implementación del "Motor Financiero".
