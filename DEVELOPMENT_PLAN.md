# Plan de Desarrollo Secuencial Detallado

Este documento es la hoja de ruta arquitectónica y de implementación para **Pool-Control Professional**. Cada paso está descrito con el máximo detalle para servir como guía técnica durante el desarrollo, asegurando que cada componente se construya con un propósito claro y se integre correctamente en el ecosistema del proyecto.

---

## FASE 0: Configuración del Monorepo

El objetivo de esta fase es establecer una base de proyecto robusta, escalable y con herramientas de desarrollo modernas.

- **1. `/package.json` (Raíz):**

  - **Propósito:** Definir el proyecto como un monorepo y centralizar la gestión de scripts.
  - **Detalles:** Se configura `private: true` para indicar que el paquete raíz no se publica. La clave `workspaces` (gestionada a través de `pnpm-workspace.yaml`) define la estructura del monorepo. Los `scripts` aquí definidos (ej. `pnpm dev:server`) actúan como atajos que delegan la ejecución a los paquetes específicos usando el flag `--filter` de pnpm.

- **2. `/pnpm-workspace.yaml`:**

  - **Propósito:** Declarar la ubicación de los sub-proyectos (workspaces).
  - **Detalles:** Este archivo contiene una única directiva (`packages: ['packages/*']`) que le indica a pnpm que cualquier subdirectorio dentro de `packages/` debe ser tratado como un proyecto individual, permitiendo la gestión centralizada de dependencias.

- **3. `/tsconfig.json` (Raíz):**

  - **Propósito:** Servir como la configuración "maestra" de TypeScript para todo el proyecto.
  - **Detalles:** Establece las reglas de compilación más estrictas y modernas para garantizar la calidad del código (`strict: true`, `verbatimModuleSyntax: true`). Configura la resolución de módulos para ESM con Node.js (`module: NodeNext`, `moduleResolution: NodeNext`), que es la base de nuestra arquitectura de backend.

- **4. `/.gitignore` (Raíz):**
  - **Propósito:** Prevenir que archivos sensibles o innecesarios sean subidos al repositorio de Git.
  - **Detalles:** Se configuran reglas para ignorar sistemáticamente directorios de dependencias (`node_modules`), archivos de entorno (`.env`), artefactos de compilación (`dist/`, `build/`) y archivos de configuración específicos de IDEs (`.vscode/`, `.idea/`).

---

## FASE 1: Fundación del Backend y Base de Datos

Esta fase construye el esqueleto completo y funcional del servidor, incluyendo la base de datos, la autenticación y la gestión de errores.

- **5. `packages/server/package.json`:**

  - **Propósito:** Gestionar las dependencias y scripts exclusivos del backend.
  - **Detalles:** Se añade `"type": "module"` para habilitar la sintaxis de ES Modules de forma nativa en Node.js. Se listan las dependencias de producción (`express`, `@prisma/client`, `jsonwebtoken`, `bcryptjs`, `cors`, `cookie-parser`) y de desarrollo (`tsx`, `@types/*`, `prisma`).

- **6. `packages/server/tsconfig.json`:**

  - **Propósito:** Especializar la configuración de TypeScript para el servidor.
  - **Detalles:** Utiliza la directiva `extends` para heredar toda la configuración del `tsconfig.json` raíz. Su única adición es `"outDir": "./dist"`, que le indica al compilador dónde debe colocar los archivos JavaScript compilados.

- **7. `packages/server/.env.example`:**

  - **Propósito:** Servir como plantilla y documentación de las variables de entorno requeridas.
  - **Detalles:** Define las claves que el servidor espera encontrar para funcionar: `DATABASE_URL` (la cadena de conexión a PostgreSQL), `PORT` (el puerto del servidor), `JWT_SECRET` (la clave secreta para firmar tokens) y `JWT_EXPIRES_IN` (la duración de los tokens en segundos).

- **8. `packages/server/prisma/schema.prisma`:**

  - **Propósito:** Es el corazón de la persistencia de datos. Define toda la arquitectura de la base de datos.
  - **Detalles:** Este archivo es la "única fuente de verdad" para los modelos de datos. Describe cada tabla (`model`), sus columnas (campos) y tipos, y, fundamentalmente, las `relation` entre ellas. Al ejecutar `pnpm prisma:migrate`, Prisma lee este archivo para generar y aplicar las migraciones SQL correspondientes.

- **9. `packages/server/src/config/index.ts`:**

  - **Propósito:** Cargar, validar y centralizar el acceso a las variables de entorno de forma segura.
  - **Detalles:** Este módulo utiliza `dotenv` para cargar el archivo `.env`. Implementa una lógica que verifica que todas las variables requeridas estén presentes, lanzando un error si falta alguna. Parsea los valores a sus tipos correctos (ej. `parseInt` para `PORT`) y exporta un único objeto `config` inmutable y tipado para su uso en el resto de la aplicación.

- **10. `packages/server/src/utils/password.utils.ts`:**

  - **Propósito:** Abstraer y centralizar la lógica de manejo de contraseñas.
  - **Detalles:** Exportará dos funciones asíncronas: `hashPassword` (que encapsula a `bcrypt.hash`) y `comparePassword` (que encapsula a `bcrypt.compare`). Esto evita la dispersión de la lógica de hashing y facilita futuras actualizaciones (ej. cambiar el número de rondas de salting).

- **11. `packages/server/src/utils/jwt.utils.ts`:**

  - **Propósito:** Abstraer y centralizar la creación y verificación de JSON Web Tokens.
  - **Detalles:** Exportará dos funciones: `signToken` (que usa el `JWT_SECRET` y `JWT_EXPIRES_IN` del `config` para crear un token a partir de un payload) y `verifyToken` (que valida un token y devuelve su payload decodificado o `null` si es inválido).

- **12. `packages/server/src/middleware/error.middleware.ts`:**

  - **Propósito:** Implementar un gestor de errores global ("catch-all").
  - **Detalles:** Se define una función con la firma especial de 4 argumentos de Express (`err, req, res, next`). Este middleware se colocará al final de la cadena de middlewares y será responsable de atrapar cualquier error lanzado en las rutas (tanto síncronos como asíncronos), registrarlo en la consola y enviar al cliente una respuesta JSON limpia y estandarizada, evitando que el servidor se caiga por una excepción no controlada.

- **13. `packages/server/src/api/auth/auth.service.ts`:**

  - **Propósito:** Contener la lógica de negocio pura y desacoplada para la autenticación.
  - **Detalles:** Este archivo se comunica directamente con la base de datos a través del Prisma Client. Contendrá funciones como `loginUser`, que buscará un usuario por email, usará `password.utils` para comparar la contraseña y, si es exitoso, devolverá los datos del usuario. No sabe nada sobre HTTP, cookies o `Request`/`Response`.

- **14. `packages/server/src/api/auth/auth.controller.ts`:**

  - **Propósito:** Orquestar el flujo de las peticiones de autenticación.
  - **Detalles:** Actúa como un "controlador de tráfico". Sus funciones reciben `req` y `res`. Extraen datos del `req.body` (email, password), llaman a los métodos correspondientes en `auth.service.ts`, y con el resultado, construyen la respuesta HTTP. Por ejemplo, en un login exitoso, llamará a `jwt.utils.signToken`, establecerá una cookie `httpOnly` en el `res`, y enviará los datos del usuario como JSON.

- **15. `packages/server/src/api/auth/auth.routes.ts`:**

  - **Propósito:** Definir los endpoints de la API de autenticación.
  - **Detalles:** Utiliza `express.Router()` para crear un mini-enrutador. Define las rutas (`POST /login`, `POST /register`, etc.) y las asocia con las funciones del controlador (`auth.controller.ts`) que las manejarán.

- **16. `packages/server/src/app.ts`:**

  - **Propósito:** Ensamblar la aplicación Express.
  - **Detalles:** Crea la instancia de `express()`. Es responsable de configurar la secuencia de middlewares globales en el orden correcto: `cors` para permitir peticiones del frontend, `express.json` para parsear bodies JSON, `cookieParser` para parsear cookies. Luego, monta el enrutador de autenticación (`auth.routes.ts`) bajo un prefijo base como `/api/auth`. Finalmente, y de forma crucial, registra el `errorHandler` como el último middleware de la pila. Exporta la instancia `app` configurada.

- **17. `packages/server/src/server.ts`:**
  - **Propósito:** Iniciar el servidor web.
  - **Detalles:** Es el punto de entrada ejecutable. Importa la instancia `app` desde `app.ts` y el objeto `config` desde `config/index.ts`. Su única responsabilidad es llamar a `app.listen()` usando el `PORT` de la configuración y mostrar un mensaje en consola para confirmar que el servidor está en línea y escuchando.

---

## FASE 2: Fundación del Frontend y Conexión

Esta fase establece la base de la aplicación React, la configura y crea la primera funcionalidad de cara al usuario: el login.

- **18-21. Archivos de Configuración (`package.json`, `tsconfig.json`, `vite.config.ts`, `theme.ts`):** Configuración inicial del proyecto de React con Vite, incluyendo dependencias (`react`, `mantine`), configuración de TypeScript y definición del tema visual de la UI.
- **22. `packages/client/src/api/apiClient.ts`:** Creación de una instancia de `axios` preconfigurada con la `baseURL` del API del backend y la opción `withCredentials: true` para asegurar que las cookies de autenticación se envíen en cada petición.
- **23. `packages/client/src/providers/AuthProvider.tsx`:** Implementación de un React Context Provider para gestionar el estado de autenticación (`usuario`, `isLoggedIn`). Expondrá funciones como `login` y `logout` que el resto de la app podrá usar.
- **24-26. `router/index.ts`, `App.tsx`, `main.tsx`:** Configuración del enrutador de la aplicación (`react-router-dom`), definiendo rutas públicas y privadas. El componente `App.tsx` envolverá toda la aplicación con el `AuthProvider` y el `MantineProvider`.
- **27. `packages/client/src/features/auth/pages/LoginPage.tsx`:** Desarrollo de la primera pantalla interactiva. Este componente contendrá el formulario de login, gestionará su estado, y al enviarse, llamará a la función `login` del `AuthProvider`, que a su vez usará el `apiClient` para realizar la petición `POST /api/auth/login` al backend.
